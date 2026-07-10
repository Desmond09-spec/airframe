package launcher

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"airframe-bootstrap/internal/logging"
)

// Launcher launches an external process and detaches from it.
type Launcher interface {
	Launch(exePath string) error
}

type launcher struct {
	log logging.Logger
}

// New creates a Launcher.
func New(log logging.Logger) Launcher {
	return &launcher{log: log}
}

// Launch starts the process at exePath in its own process group and returns
// immediately — Bootstrap does not wait for the child process.
func (l *launcher) Launch(exePath string) error {
	exePath = filepath.Clean(exePath)
	if _, err := os.Stat(exePath); os.IsNotExist(err) {
		return fmt.Errorf("launcher: executable not found: %s", exePath)
	}

	l.log.Info("launcher", "launching process",
		logging.F("exe", exePath),
	)

	cmd := exec.Command(exePath)
	cmd.Dir = filepath.Dir(exePath)
	cmd.Stdout = nil
	cmd.Stderr = nil
	cmd.Stdin = nil

	// Detach: CREATE_NEW_PROCESS_GROUP on Windows, setsid on Unix.
	cmd.SysProcAttr = detachSysProcAttr()

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("launcher: start %s: %w", exePath, err)
	}

	// Disown the child — Bootstrap must not wait.
	go cmd.Wait() //nolint:errcheck

	l.log.Info("launcher", "process launched",
		logging.F("exe", filepath.Base(exePath)),
		logging.F("pid", cmd.Process.Pid),
	)
	return nil
}

// detachSysProcAttr returns platform-specific attributes that detach the child.
// Platform implementations are in launcher_windows.go / launcher_other.go.
