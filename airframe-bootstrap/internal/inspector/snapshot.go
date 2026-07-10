package inspector

import "time"

// Snapshot describes the host machine's environment at the time of inspection.
// This is logged in full at startup and attached to any error report.
type Snapshot struct {
	OS              string    // "windows"
	Arch            string    // "amd64", "arm64"
	OSBuildNumber   uint32    // e.g. 22621 (Win 11 22H2)
	OSVersionString string    // e.g. "Windows 11 22H2"
	IsAdmin         bool
	HasWebView2     bool
	WebView2Version string
	TotalDiskBytes  uint64
	FreeDiskBytes   uint64
	TempDir         string
	InstallDir      string
	StagingDir      string
	LogPath         string
	InspectedAt     time.Time
}
