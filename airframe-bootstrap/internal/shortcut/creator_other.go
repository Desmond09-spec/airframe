//go:build !windows

package shortcut

import "airframe-bootstrap/internal/logging"

// Creator is a no-op on non-Windows platforms.
type Creator interface {
	CreateStartMenuShortcut(name, targetExe, workDir, description, iconPath string) error
	CreateDesktopShortcut(name, targetExe, workDir, description, iconPath string) error
}

type creator struct{ log logging.Logger }

func New(log logging.Logger) Creator { return &creator{log: log} }

func (c *creator) CreateStartMenuShortcut(_, _, _, _, _ string) error { return nil }
func (c *creator) CreateDesktopShortcut(_, _, _, _, _ string) error   { return nil }
