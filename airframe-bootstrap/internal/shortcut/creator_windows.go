//go:build windows

package shortcut

import (
	"fmt"
	"os"
	"path/filepath"

	"airframe-bootstrap/internal/logging"
	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
)

// Creator creates Windows .lnk shortcut files.
type Creator interface {
	CreateStartMenuShortcut(name, targetExe, workDir, description, iconPath string) error
	CreateDesktopShortcut(name, targetExe, workDir, description, iconPath string) error
}

type creator struct {
	log logging.Logger
}

// New creates a shortcut Creator.
func New(log logging.Logger) Creator {
	return &creator{log: log}
}

// CreateStartMenuShortcut creates a .lnk in the user's Start Menu Programs folder.
func (c *creator) CreateStartMenuShortcut(name, targetExe, workDir, description, iconPath string) error {
	startMenu := os.Getenv("APPDATA")
	if startMenu == "" {
		return fmt.Errorf("shortcut: APPDATA not set")
	}
	dir := filepath.Join(startMenu, "Microsoft", "Windows", "Start Menu", "Programs")
	lnkPath := filepath.Join(dir, name+".lnk")
	return c.createLnk(lnkPath, targetExe, workDir, description, iconPath)
}

// CreateDesktopShortcut creates a .lnk on the user's desktop.
func (c *creator) CreateDesktopShortcut(name, targetExe, workDir, description, iconPath string) error {
	userProfile := os.Getenv("USERPROFILE")
	if userProfile == "" {
		return fmt.Errorf("shortcut: USERPROFILE not set")
	}
	lnkPath := filepath.Join(userProfile, "Desktop", name+".lnk")
	return c.createLnk(lnkPath, targetExe, workDir, description, iconPath)
}

// createLnk uses IShellLink via COM to create a .lnk file.
func (c *creator) createLnk(lnkPath, targetExe, workDir, description, iconPath string) error {
	c.log.Info("shortcut", "creating shortcut",
		logging.F("lnk", filepath.Base(lnkPath)),
		logging.F("target", targetExe),
	)

	ole.CoInitializeEx(0, ole.COINIT_APARTMENTTHREADED)
	defer ole.CoUninitialize()

	unknown, err := oleutil.CreateObject("WScript.Shell")
	if err != nil {
		return fmt.Errorf("shortcut: create WScript.Shell: %w", err)
	}
	defer unknown.Release()

	wshell, err := unknown.QueryInterface(ole.IID_IDispatch)
	if err != nil {
		return fmt.Errorf("shortcut: QueryInterface IDispatch: %w", err)
	}
	defer wshell.Release()

	// wshell.CreateShortcut(lnkPath)
	cs, err := oleutil.CallMethod(wshell, "CreateShortcut", lnkPath)
	if err != nil {
		return fmt.Errorf("shortcut: CreateShortcut: %w", err)
	}
	shortcut := cs.ToIDispatch()
	defer shortcut.Release()

	oleutil.PutProperty(shortcut, "TargetPath", targetExe)          //nolint:errcheck
	oleutil.PutProperty(shortcut, "WorkingDirectory", workDir)       //nolint:errcheck
	oleutil.PutProperty(shortcut, "Description", description)        //nolint:errcheck
	if iconPath != "" {
		oleutil.PutProperty(shortcut, "IconLocation", iconPath+",0") //nolint:errcheck
	}

	_, err = oleutil.CallMethod(shortcut, "Save")
	if err != nil {
		return fmt.Errorf("shortcut: Save: %w", err)
	}

	c.log.Info("shortcut", "shortcut created", logging.F("lnk", lnkPath))
	return nil
}
