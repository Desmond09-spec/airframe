package extract

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"airframe-bootstrap/internal/logging"
)

// Extractor extracts zip archives into a destination directory.
type Extractor interface {
	Extract(src string, dst string) error
}

type extractor struct {
	log logging.Logger
}

// New creates an Extractor.
func New(log logging.Logger) Extractor {
	return &extractor{log: log}
}

// Extract opens the zip at src and writes all entries under dst.
// Zip-slip is prevented: any entry whose resolved path escapes dst is rejected.
func (e *extractor) Extract(src string, dst string) error {
	e.log.Info("extract", "extracting archive",
		logging.F("src", filepath.Base(src)),
		logging.F("dst", dst),
	)

	r, err := zip.OpenReader(src)
	if err != nil {
		return fmt.Errorf("extract: open zip %s: %w", src, err)
	}
	defer r.Close()

	cleanDst := filepath.Clean(dst) + string(os.PathSeparator)

	for _, f := range r.File {
		destPath := filepath.Join(dst, filepath.Clean(f.Name))

		// Zip-slip protection.
		if !strings.HasPrefix(destPath, cleanDst) {
			return fmt.Errorf("extract: illegal path in archive: %s", f.Name)
		}

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(destPath, 0755); err != nil {
				return fmt.Errorf("extract: mkdir %s: %w", destPath, err)
			}
			continue
		}

		// Ensure parent directory exists.
		if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
			return fmt.Errorf("extract: mkdir parent %s: %w", filepath.Dir(destPath), err)
		}

		if err := writeEntry(f, destPath); err != nil {
			return err
		}
	}

	e.log.Info("extract", "extraction complete",
		logging.F("src", filepath.Base(src)),
		logging.F("files", len(r.File)),
	)
	return nil
}

func writeEntry(f *zip.File, destPath string) error {
	rc, err := f.Open()
	if err != nil {
		return fmt.Errorf("extract: open entry %s: %w", f.Name, err)
	}
	defer rc.Close()

	out, err := os.OpenFile(destPath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, f.Mode())
	if err != nil {
		return fmt.Errorf("extract: create %s: %w", destPath, err)
	}
	defer out.Close()

	if _, err := io.Copy(out, rc); err != nil {
		return fmt.Errorf("extract: write %s: %w", destPath, err)
	}
	return nil
}
