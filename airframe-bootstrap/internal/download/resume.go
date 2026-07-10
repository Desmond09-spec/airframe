package download

import "os"

// resumeOffset returns the byte length of an existing .partial file,
// or 0 if the file does not exist.
func resumeOffset(partPath string) int64 {
	info, err := os.Stat(partPath)
	if err != nil {
		return 0
	}
	return info.Size()
}
