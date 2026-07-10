//go:build windows

package inspector

import (
	"fmt"
	"unsafe"

	"golang.org/x/sys/windows"
	"golang.org/x/sys/windows/registry"
)

// osVersion returns (buildNumber, majorVersion, minorVersion) using RtlGetVersion.
func osVersion() (build, major, minor uint32) {
	type osVersionInfo struct {
		DwOSVersionInfoSize uint32
		DwMajorVersion      uint32
		DwMinorVersion      uint32
		DwBuildNumber       uint32
		DwPlatformId        uint32
		SzCSDVersion        [128]uint16
	}

	ntdll := windows.MustLoadDLL("ntdll.dll")
	rtlGetVersion := ntdll.MustFindProc("RtlGetVersion")

	var info osVersionInfo
	info.DwOSVersionInfoSize = uint32(unsafe.Sizeof(info))
	rtlGetVersion.Call(uintptr(unsafe.Pointer(&info)))

	return info.DwBuildNumber, info.DwMajorVersion, info.DwMinorVersion
}

// isAdmin returns true if the current process token is elevated.
func isAdmin() bool {
	token := windows.GetCurrentProcessToken()
	return token.IsElevated()
}

// checkWebView2 probes the Windows registry for the WebView2 runtime.
func checkWebView2() (bool, string) {
	const key = `SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}`
	k, err := registry.OpenKey(registry.LOCAL_MACHINE, key, registry.QUERY_VALUE)
	if err != nil {
		// Also try HKCU.
		k, err = registry.OpenKey(registry.CURRENT_USER, key, registry.QUERY_VALUE)
		if err != nil {
			return false, ""
		}
	}
	defer k.Close()

	ver, _, err := k.GetStringValue("pv")
	if err != nil {
		return false, ""
	}
	return true, ver
}

// diskSpace returns total and free bytes for the volume containing path.
func diskSpace(path string) (total, free uint64, err error) {
	pathPtr, err := windows.UTF16PtrFromString(path)
	if err != nil {
		return 0, 0, fmt.Errorf("inspector: disk space path: %w", err)
	}
	var freeBytesAvailable, totalBytes, totalFreeBytes uint64
	err = windows.GetDiskFreeSpaceEx(
		pathPtr,
		&freeBytesAvailable,
		&totalBytes,
		&totalFreeBytes,
	)
	if err != nil {
		return 0, 0, fmt.Errorf("inspector: GetDiskFreeSpaceEx: %w", err)
	}
	return totalBytes, freeBytesAvailable, nil
}
