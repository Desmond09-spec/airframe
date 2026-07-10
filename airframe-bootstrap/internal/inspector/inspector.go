package inspector

import (
	"context"
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/pkg/platform"
)

// Inspector probes the host machine and returns an EnvironmentSnapshot.
type Inspector interface {
	Inspect(ctx context.Context) (Snapshot, error)
}

type inspector struct {
	log logging.Logger
}

// New creates an Inspector.
func New(log logging.Logger) Inspector {
	return &inspector{log: log}
}

// Inspect performs all environment checks and returns a Snapshot.
func (ins *inspector) Inspect(ctx context.Context) (Snapshot, error) {
	snap := Snapshot{
		OS:          runtime.GOOS,
		Arch:        runtime.GOARCH,
		TempDir:     os.TempDir(),
		InspectedAt: time.Now(),
	}

	// Resolve install + staging dirs.
	installDir, err := platform.DashboardInstallDir()
	if err != nil {
		return snap, fmt.Errorf("inspector: resolve install dir: %w", err)
	}
	snap.InstallDir = installDir

	stagingDir, err := platform.StagingDir()
	if err != nil {
		return snap, fmt.Errorf("inspector: resolve staging dir: %w", err)
	}
	snap.StagingDir = stagingDir

	logPath, err := platform.LogFilePath()
	if err != nil {
		snap.LogPath = ""
	} else {
		snap.LogPath = logPath
	}

	// OS version (Windows-specific, falls back to generic on other platforms).
	snap.OSBuildNumber, snap.OSVersionString = detectOSVersion()

	// WebView2 detection (Windows-specific).
	snap.HasWebView2, snap.WebView2Version = detectWebView2()

	// Admin rights.
	snap.IsAdmin = detectAdminRights()

	// Disk space on the install drive.
	total, free, err := detectDiskSpace(installDir)
	if err != nil {
		ins.log.Warn("inspector", "disk space check failed", logging.F("err", err.Error()))
	}
	snap.TotalDiskBytes = total
	snap.FreeDiskBytes = free

	ins.log.Info("inspector", "environment snapshot",
		logging.F("os", snap.OS),
		logging.F("arch", snap.Arch),
		logging.F("os_version", snap.OSVersionString),
		logging.F("is_admin", snap.IsAdmin),
		logging.F("has_webview2", snap.HasWebView2),
		logging.F("free_disk_gb", snap.FreeDiskBytes/1024/1024/1024),
		logging.F("install_dir", snap.InstallDir),
	)

	// Validate minimum requirements.
	if snap.OS == "windows" {
		// Windows 10 build 17763+ required.
		if snap.OSBuildNumber > 0 && snap.OSBuildNumber < 17763 {
			return snap, fmt.Errorf("inspector: Windows 10 build 17763 or later is required (current: %d)", snap.OSBuildNumber)
		}
		if !snap.IsAdmin {
			ins.log.Warn("inspector", "not running as administrator — registry writes will be per-user only")
		}
	}

	return snap, nil
}

// detectOSVersion returns OS build number and a human-readable version string.
// On non-Windows, returns zeros and a generic string.
func detectOSVersion() (uint32, string) {
	build, major, minor := osVersion()
	if build == 0 {
		return 0, runtime.GOOS
	}
	switch {
	case major == 10 && minor == 0 && build >= 22000:
		return build, fmt.Sprintf("Windows 11 (build %d)", build)
	case major == 10 && minor == 0:
		return build, fmt.Sprintf("Windows 10 (build %d)", build)
	default:
		return build, fmt.Sprintf("Windows %d.%d (build %d)", major, minor, build)
	}
}

// detectAdminRights returns true if the process has elevated privileges.
func detectAdminRights() bool {
	return isAdmin()
}

// detectWebView2 checks if WebView2 runtime is installed.
func detectWebView2() (bool, string) {
	return checkWebView2()
}

// detectDiskSpace returns total and free bytes for the volume containing path.
func detectDiskSpace(path string) (total, free uint64, err error) {
	// Ensure path exists so we can stat the drive.
	if err := os.MkdirAll(path, 0755); err != nil {
		// Use root drive of LOCALAPPDATA as fallback.
		localapp := os.Getenv("LOCALAPPDATA")
		if localapp == "" {
			return 0, 0, fmt.Errorf("cannot determine install drive")
		}
		// Use just the drive letter root.
		if len(localapp) >= 3 && localapp[1] == ':' {
			path = localapp[:3]
		}
	}
	return diskSpace(path)
}

// validateDiskSpace checks that there is enough free space for installation.
// requiredBytes should be the total package download size * 1.2.
func validateDiskSpace(snap Snapshot, requiredBytes int64) error {
	needed := uint64(float64(requiredBytes) * 1.2)
	if snap.FreeDiskBytes > 0 && snap.FreeDiskBytes < needed {
		gb := float64(needed) / 1024 / 1024 / 1024
		return fmt.Errorf("inspector: insufficient disk space — %.1f GB required", gb)
	}
	return nil
}

// ValidateForInstall checks that the snapshot meets all requirements given
// the total bytes that will be downloaded.
func ValidateForInstall(snap Snapshot, totalDownloadBytes int64) error {
	_ = strings.ToLower // keep import live
	return validateDiskSpace(snap, totalDownloadBytes)
}
