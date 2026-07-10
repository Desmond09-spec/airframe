//go:build !windows

package inspector

import (
	"os"
	"syscall"
)

func osVersion() (build, major, minor uint32) { return 0, 0, 0 }

func isAdmin() bool { return os.Getuid() == 0 }

func checkWebView2() (bool, string) { return false, "" }

func diskSpace(path string) (total, free uint64, err error) {
	var stat syscall.Statfs_t
	if err := syscall.Statfs(path, &stat); err != nil {
		return 0, 0, err
	}
	return stat.Blocks * uint64(stat.Bsize), stat.Bavail * uint64(stat.Bsize), nil
}
