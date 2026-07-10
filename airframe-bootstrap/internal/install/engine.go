package install

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"airframe-bootstrap/internal/logging"
)

// Engine moves extracted files from a source tree into the final install directory.
// Every file move is registered with the RollbackManager before execution.
type Engine interface {
	Install(ctx context.Context, srcDir string, dstDir string) error
}

type engine struct {
	log      logging.Logger
	rollback *RollbackManager
}

// NewEngine creates an Engine.
func NewEngine(log logging.Logger, rollback *RollbackManager) Engine {
	return &engine{log: log, rollback: rollback}
}

// Install walks srcDir recursively and moves every file into the corresponding
// path under dstDir. Existing files are backed up before being replaced.
// On any error, Rollback is called to undo all completed moves.
func (e *engine) Install(ctx context.Context, srcDir string, dstDir string) error {
	e.log.Info("install", "installing files",
		logging.F("src", srcDir),
		logging.F("dst", dstDir),
	)

	if err := os.MkdirAll(dstDir, 0755); err != nil {
		return fmt.Errorf("install: create dst dir %s: %w", dstDir, err)
	}

	backupDir := dstDir + ".backup"
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return fmt.Errorf("install: create backup dir: %w", err)
	}

	var fileCount int
	err := filepath.WalkDir(srcDir, func(src string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		rel, err := filepath.Rel(srcDir, src)
		if err != nil {
			return fmt.Errorf("install: rel path: %w", err)
		}

		dst := filepath.Join(dstDir, rel)

		if d.IsDir() {
			return os.MkdirAll(dst, 0755)
		}

		return e.installFile(src, dst, backupDir, rel, &fileCount)
	})

	if err != nil {
		e.log.Error("install", "installation failed — rolling back",
			logging.F("err", err.Error()),
		)
		if rbErr := e.rollback.Rollback(); rbErr != nil {
			e.log.Error("install", "rollback also failed",
				logging.F("err", rbErr.Error()),
			)
		}
		// Clean up backup dir.
		os.RemoveAll(backupDir)
		return fmt.Errorf("install: %w", err)
	}

	e.log.Info("install", "installation complete",
		logging.F("files", fileCount),
		logging.F("dst", dstDir),
	)
	return nil
}

// installFile moves a single file from src to dst, backing up any existing file.
func (e *engine) installFile(src, dst, backupDir, rel string, count *int) error {
	var backupPath string

	// If a file already exists at dst, move it to backup.
	if _, err := os.Stat(dst); err == nil {
		backupPath = filepath.Join(backupDir, rel)
		if err := os.MkdirAll(filepath.Dir(backupPath), 0755); err != nil {
			return fmt.Errorf("install: create backup parent for %s: %w", rel, err)
		}
		if err := os.Rename(dst, backupPath); err != nil {
			return fmt.Errorf("install: backup existing file %s: %w", dst, err)
		}
	}

	// Register the planned move with the rollback manager.
	e.rollback.Record(dst, backupPath, src)

	// Ensure the destination parent directory exists.
	if err := os.MkdirAll(filepath.Dir(dst), 0755); err != nil {
		return fmt.Errorf("install: create dst parent for %s: %w", dst, err)
	}

	// Move the new file into place.
	if err := os.Rename(src, dst); err != nil {
		// If rename fails (cross-device), fall back to copy.
		if err2 := copyFile(src, dst); err2 != nil {
			return fmt.Errorf("install: move %s → %s: %w", src, dst, err)
		}
		os.Remove(src) //nolint:errcheck
	}

	*count++
	return nil
}

// copyFile copies a file byte-by-byte (fallback for cross-device moves).
func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	info, err := in.Stat()
	if err != nil {
		return err
	}

	out, err := os.OpenFile(dst, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, info.Mode())
	if err != nil {
		return err
	}
	defer out.Close()

	buf := make([]byte, 64*1024)
	for {
		n, err := in.Read(buf)
		if n > 0 {
			if _, werr := out.Write(buf[:n]); werr != nil {
				return werr
			}
		}
		if err != nil {
			break
		}
	}
	return nil
}
