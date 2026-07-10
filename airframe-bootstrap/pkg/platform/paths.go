package platform

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// InstallDir returns the root Airframe installation directory.
// e.g. C:\Users\<user>\AppData\Local\Airframe
func InstallDir() (string, error) {
	local := os.Getenv("LOCALAPPDATA")
	if local == "" {
		return "", fmt.Errorf("platform: LOCALAPPDATA is not set")
	}
	return filepath.Join(local, "Airframe"), nil
}

// DashboardInstallDir returns the installation directory for the Dashboard.
func DashboardInstallDir() (string, error) {
	root, err := InstallDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(root, "airframe-dashboard"), nil
}

// StagingDir returns the directory where packages are downloaded.
func StagingDir() (string, error) {
	root, err := InstallDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(root, "bootstrap", "staging"), nil
}

// ExtractDir returns the directory where packages are extracted.
func ExtractDir() (string, error) {
	root, err := InstallDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(root, "bootstrap", "extract"), nil
}

// LogDir returns the directory where log files are written.
func LogDir() (string, error) {
	root, err := InstallDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(root, "bootstrap", "logs"), nil
}

// LogFilePath returns the path to today's log file.
func LogFilePath() (string, error) {
	dir, err := LogDir()
	if err != nil {
		return "", err
	}
	name := fmt.Sprintf("bootstrap-%s.log", time.Now().Format("2006-01-02"))
	return filepath.Join(dir, name), nil
}

// LockFilePath returns the path to the installation lock file.
func LockFilePath() (string, error) {
	root, err := InstallDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(root, ".install-lock"), nil
}

// ExpandEnv expands environment variable placeholders in a path string.
// Handles %VAR% (Windows) and $VAR (Unix) style placeholders.
func ExpandEnv(s string) string {
	return os.ExpandEnv(
		// Convert %VAR% Windows style to $VAR for os.ExpandEnv
		expandWindowsVars(s),
	)
}

func expandWindowsVars(s string) string {
	result := ""
	i := 0
	for i < len(s) {
		if s[i] == '%' {
			j := i + 1
			for j < len(s) && s[j] != '%' {
				j++
			}
			if j < len(s) {
				varName := s[i+1 : j]
				result += "$" + varName
				i = j + 1
				continue
			}
		}
		result += string(s[i])
		i++
	}
	return result
}

// EnsureDir creates a directory and all parents if they don't exist.
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}
