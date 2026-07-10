package install

import (
	"fmt"
	"os"
	"sync"

	"airframe-bootstrap/internal/logging"
)

// operation records one atomic file move so it can be reversed.
type operation struct {
	newPath      string // where the new file was placed
	backupPath   string // where the old file was moved (empty if no pre-existing file)
	originalPath string // original location of the old file
}

// RollbackManager records file operations and can reverse them in LIFO order.
type RollbackManager struct {
	mu     sync.Mutex
	ops    []operation
	log    logging.Logger
}

// NewRollbackManager creates a RollbackManager.
func NewRollbackManager(log logging.Logger) *RollbackManager {
	return &RollbackManager{log: log}
}

// Record adds an operation to the rollback log.
// originalPath is where the file used to live (empty if it didn't exist).
// backupPath is where we moved it for safekeeping (empty if no backup needed).
// newPath is where the new file was placed.
func (r *RollbackManager) Record(originalPath, backupPath, newPath string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ops = append(r.ops, operation{
		newPath:      newPath,
		backupPath:   backupPath,
		originalPath: originalPath,
	})
}

// Rollback reverses all recorded operations in reverse order.
// Best-effort: continues rolling back even if individual operations fail.
func (r *RollbackManager) Rollback() error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.log.Info("install", "rolling back installation", logging.F("operations", len(r.ops)))
	var firstErr error

	for i := len(r.ops) - 1; i >= 0; i-- {
		op := r.ops[i]

		// Remove the newly installed file.
		if op.newPath != "" {
			if err := os.Remove(op.newPath); err != nil && !os.IsNotExist(err) {
				r.log.Error("install", "rollback: remove new file failed",
					logging.F("path", op.newPath),
					logging.F("err", err.Error()),
				)
				if firstErr == nil {
					firstErr = fmt.Errorf("rollback: remove %s: %w", op.newPath, err)
				}
			}
		}

		// Restore backup to original location.
		if op.backupPath != "" && op.originalPath != "" {
			if err := os.Rename(op.backupPath, op.originalPath); err != nil {
				r.log.Error("install", "rollback: restore backup failed",
					logging.F("backup", op.backupPath),
					logging.F("original", op.originalPath),
					logging.F("err", err.Error()),
				)
				if firstErr == nil {
					firstErr = fmt.Errorf("rollback: restore %s: %w", op.originalPath, err)
				}
			}
		}
	}

	r.ops = nil
	return firstErr
}

// Commit cleans up all backup files — called after a successful installation.
func (r *RollbackManager) Commit() {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.log.Info("install", "committing installation", logging.F("operations", len(r.ops)))
	for _, op := range r.ops {
		if op.backupPath != "" {
			if err := os.Remove(op.backupPath); err != nil && !os.IsNotExist(err) {
				r.log.Warn("install", "commit: could not remove backup",
					logging.F("path", op.backupPath),
					logging.F("err", err.Error()),
				)
			}
		}
	}
	r.ops = nil
}
