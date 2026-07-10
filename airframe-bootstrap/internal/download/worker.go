package download

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"time"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/internal/manifest"
	"airframe-bootstrap/internal/progress"
	"airframe-bootstrap/pkg/httpclient"
)

const chunkSize = 64 * 1024 // 64 KB

// worker downloads a single package to stagingDir.
type worker struct {
	pkg     manifest.PackageEntry
	dir     string
	client  *httpclient.Client
	log     logging.Logger
	emitter *progress.Emitter
}

// run executes the download, resuming from a .partial file if one exists.
// Returns the final path of the downloaded file.
func (w *worker) run(ctx context.Context) (string, error) {
	destPath := filepath.Join(w.dir, w.pkg.ID+".zip")
	partPath := destPath + ".partial"

	// Check if this is a local file:// URL — copy directly.
	if strings.HasPrefix(w.pkg.URL, "file://") {
		return w.copyLocalFile(ctx, destPath)
	}

	// Check for a resumable partial file.
	startByte := resumeOffset(partPath)
	if startByte > 0 {
		w.log.Info("download", "resuming download",
			logging.F("package", w.pkg.ID),
			logging.F("from_byte", startByte),
		)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, w.pkg.URL, nil)
	if err != nil {
		return "", fmt.Errorf("download: build request for %s: %w", w.pkg.ID, err)
	}
	if startByte > 0 {
		req.Header.Set("Range", fmt.Sprintf("bytes=%d-", startByte))
	}

	resp, err := w.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("download: fetch %s: %w", w.pkg.ID, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusPartialContent {
		return "", fmt.Errorf("download: unexpected status %d for %s", resp.StatusCode, w.pkg.ID)
	}

	flag := os.O_CREATE | os.O_WRONLY
	if startByte > 0 && resp.StatusCode == http.StatusPartialContent {
		flag |= os.O_APPEND
	}
	f, err := os.OpenFile(partPath, flag, 0644)
	if err != nil {
		return "", fmt.Errorf("download: open partial file: %w", err)
	}
	defer f.Close()

	buf := make([]byte, chunkSize)
	var totalWritten int64
	if startByte > 0 {
		totalWritten = startByte
	}
	var speedBytes atomic.Int64
	lastSpeedCheck := time.Now()
	var speedBps int64

	for {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		default:
		}

		n, err := resp.Body.Read(buf)
		if n > 0 {
			if _, werr := f.Write(buf[:n]); werr != nil {
				return "", fmt.Errorf("download: write %s: %w", w.pkg.ID, werr)
			}
			totalWritten += int64(n)
			speedBytes.Add(int64(n))

			// Update speed every 500ms.
			if elapsed := time.Since(lastSpeedCheck); elapsed >= 500*time.Millisecond {
				speedBps = speedBytes.Load() * int64(time.Second) / int64(elapsed)
				speedBytes.Store(0)
				lastSpeedCheck = time.Now()
			}

			w.emitter.Progress(progress.ProgressEvent{
				PackageID:  w.pkg.ID,
				BytesDone:  totalWritten,
				BytesTotal: w.pkg.SizeBytes,
				SpeedBps:   speedBps,
			})
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("download: read %s: %w", w.pkg.ID, err)
		}
	}

	f.Close()

	// Rename .partial → final name.
	if err := os.Rename(partPath, destPath); err != nil {
		return "", fmt.Errorf("download: rename partial: %w", err)
	}

	w.log.Info("download", "download complete",
		logging.F("package", w.pkg.ID),
		logging.F("bytes", totalWritten),
	)
	return destPath, nil
}

// copyLocalFile copies a file:// URL source to destPath.
func (w *worker) copyLocalFile(ctx context.Context, destPath string) (string, error) {
	src := strings.TrimPrefix(w.pkg.URL, "file://")
	// Fix Windows path: /C:/... → C:/...
	if len(src) > 2 && src[0] == '/' && src[2] == ':' {
		src = src[1:]
	}

	w.log.Info("download", "copying local file",
		logging.F("package", w.pkg.ID),
		logging.F("src", src),
	)

	in, err := os.Open(src)
	if err != nil {
		return "", fmt.Errorf("download: open local file %s: %w", src, err)
	}
	defer in.Close()

	out, err := os.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("download: create dest %s: %w", destPath, err)
	}
	defer out.Close()

	var totalWritten int64
	buf := make([]byte, chunkSize)
	for {
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		default:
		}
		n, err := in.Read(buf)
		if n > 0 {
			if _, werr := out.Write(buf[:n]); werr != nil {
				return "", fmt.Errorf("download: write local copy: %w", werr)
			}
			totalWritten += int64(n)
			w.emitter.Progress(progress.ProgressEvent{
				PackageID:  w.pkg.ID,
				BytesDone:  totalWritten,
				BytesTotal: w.pkg.SizeBytes,
				SpeedBps:   500 * 1024 * 1024, // local copy is fast
			})
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("download: read local file: %w", err)
		}
	}

	w.log.Info("download", "local copy complete",
		logging.F("package", w.pkg.ID),
		logging.F("bytes", totalWritten),
	)
	return destPath, nil
}
