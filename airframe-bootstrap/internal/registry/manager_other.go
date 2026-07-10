//go:build !windows

package registry

import "airframe-bootstrap/internal/logging"

// Manager is a no-op on non-Windows platforms.
type Manager interface {
	WriteUninstallEntry(info UninstallInfo) error
	WriteFileAssociation(ext, progID, friendlyName, openCmd, iconPath string) error
	WriteBootstrapState(state string) error
}

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

type mgr struct{ log logging.Logger }

func New(log logging.Logger) Manager { return &mgr{log: log} }

func (m *mgr) WriteUninstallEntry(info UninstallInfo) error  { return nil }
func (m *mgr) WriteFileAssociation(_, _, _, _, _ string) error { return nil }
func (m *mgr) WriteBootstrapState(_ string) error              { return nil }
