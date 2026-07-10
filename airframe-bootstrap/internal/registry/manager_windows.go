//go:build windows

package registry

import (
	"fmt"

	"airframe-bootstrap/internal/logging"
	"golang.org/x/sys/windows"
	"golang.org/x/sys/windows/registry"
)

// UninstallInfo holds the data written to Add/Remove Programs.
type UninstallInfo struct {
	DisplayName    string
	DisplayVersion string
	Publisher      string
	InstallDir     string
	ExePath        string
	UninstallCmd   string
	EstimatedKB    uint32
	InfoURL        string
}

// Manager writes and removes Windows registry entries for Airframe.
type Manager interface {
	WriteUninstallEntry(info UninstallInfo) error
	WriteFileAssociation(ext, progID, friendlyName, openCmd, iconPath string) error
	WriteBootstrapState(state string) error
}

type mgr struct {
	log logging.Logger
}

// New creates a registry Manager.
func New(log logging.Logger) Manager {
	return &mgr{log: log}
}

const (
	uninstallRoot = `SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`
	airframeKey   = `SOFTWARE\Airframe`
)

// WriteUninstallEntry writes the Add/Remove Programs entry.
// Attempts HKLM first; falls back to HKCU if not running as admin.
func (m *mgr) WriteUninstallEntry(info UninstallInfo) error {
	subKey := uninstallRoot + `\` + info.DisplayName

	k, _, err := registry.CreateKey(registry.LOCAL_MACHINE, subKey, registry.ALL_ACCESS)
	if err != nil {
		m.log.Warn("registry", "HKLM write failed, falling back to HKCU",
			logging.F("err", err.Error()),
		)
		k, _, err = registry.CreateKey(registry.CURRENT_USER, subKey, registry.ALL_ACCESS)
		if err != nil {
			return fmt.Errorf("registry: create uninstall key: %w", err)
		}
	}
	defer k.Close()

	setStr := func(name, val string) error {
		if err := k.SetStringValue(name, val); err != nil {
			return fmt.Errorf("registry: set %s: %w", name, err)
		}
		return nil
	}

	for _, pair := range [][2]string{
		{"DisplayName", info.DisplayName},
		{"DisplayVersion", info.DisplayVersion},
		{"Publisher", info.Publisher},
		{"InstallLocation", info.InstallDir},
		{"UninstallString", info.UninstallCmd},
		{"DisplayIcon", info.ExePath + ",0"},
		{"URLInfoAbout", info.InfoURL},
	} {
		if err := setStr(pair[0], pair[1]); err != nil {
			return err
		}
	}

	if err := k.SetDWordValue("EstimatedSize", info.EstimatedKB); err != nil {
		return fmt.Errorf("registry: set EstimatedSize: %w", err)
	}
	if err := k.SetDWordValue("NoModify", 1); err != nil {
		return fmt.Errorf("registry: set NoModify: %w", err)
	}

	m.log.Info("registry", "uninstall entry written",
		logging.F("display_name", info.DisplayName),
	)
	return nil
}

// WriteFileAssociation registers a file extension with Windows Explorer.
func (m *mgr) WriteFileAssociation(ext, progID, friendlyName, openCmd, iconPath string) error {
	// HKCU\SOFTWARE\Classes\.<ext>
	extKey := `SOFTWARE\Classes\` + ext
	k, _, err := registry.CreateKey(registry.CURRENT_USER, extKey, registry.ALL_ACCESS)
	if err != nil {
		return fmt.Errorf("registry: create ext key %s: %w", ext, err)
	}
	if err := k.SetStringValue("", progID); err != nil {
		k.Close()
		return fmt.Errorf("registry: set default for %s: %w", ext, err)
	}
	k.Close()

	// HKCU\SOFTWARE\Classes\<progID>
	progKey := `SOFTWARE\Classes\` + progID
	pk, _, err := registry.CreateKey(registry.CURRENT_USER, progKey, registry.ALL_ACCESS)
	if err != nil {
		return fmt.Errorf("registry: create progID key: %w", err)
	}
	pk.SetStringValue("", friendlyName)        //nolint:errcheck
	pk.SetStringValue("FriendlyTypeName", friendlyName) //nolint:errcheck
	pk.Close()

	// …\shell\open\command
	cmdKey := progKey + `\shell\open\command`
	ck, _, err := registry.CreateKey(registry.CURRENT_USER, cmdKey, registry.ALL_ACCESS)
	if err != nil {
		return fmt.Errorf("registry: create open command key: %w", err)
	}
	ck.SetStringValue("", openCmd) //nolint:errcheck
	ck.Close()

	// …\DefaultIcon
	iconKey := progKey + `\DefaultIcon`
	ik, _, err := registry.CreateKey(registry.CURRENT_USER, iconKey, registry.ALL_ACCESS)
	if err != nil {
		return fmt.Errorf("registry: create icon key: %w", err)
	}
	ik.SetStringValue("", iconPath) //nolint:errcheck
	ik.Close()

	// Notify the shell.
	notifyShell()

	m.log.Info("registry", "file association written",
		logging.F("ext", ext),
		logging.F("prog_id", progID),
	)
	return nil
}

// WriteBootstrapState records the current installation phase in the registry.
// This is read on restart to detect interrupted installations.
func (m *mgr) WriteBootstrapState(state string) error {
	k, _, err := registry.CreateKey(registry.CURRENT_USER,
		airframeKey+`\Bootstrap`, registry.ALL_ACCESS)
	if err != nil {
		return fmt.Errorf("registry: create bootstrap state key: %w", err)
	}
	defer k.Close()
	if err := k.SetStringValue("State", state); err != nil {
		return fmt.Errorf("registry: set State: %w", err)
	}
	return nil
}

// notifyShell calls SHChangeNotify to refresh file association cache.
// Best-effort — failure is silently ignored.
func notifyShell() {
	shell32, err := windows.LoadDLL("shell32.dll")
	if err != nil {
		return
	}
	proc, err := shell32.FindProc("SHChangeNotify")
	if err != nil {
		return
	}
	// SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_IDLIST = 0x0
	proc.Call(0x08000000, 0, 0, 0) //nolint:errcheck
}
