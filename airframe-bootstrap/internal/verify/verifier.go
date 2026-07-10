package verify

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"airframe-bootstrap/internal/logging"
)

// Verifier checks the SHA-256 integrity of downloaded packages.
type Verifier interface {
	Verify(path string, expectedHex string) error
}

type verifier struct {
	log logging.Logger
}

// New creates a Verifier.
func New(log logging.Logger) Verifier {
	return &verifier{log: log}
}

// Verify computes the SHA-256 of the file at path and compares it to expectedHex.
// Returns an error if the hashes do not match.
func (v *verifier) Verify(path string, expectedHex string) error {
	v.log.Info("verify", "verifying package", logging.F("file", filepath.Base(path)))

	f, err := os.Open(path)
	if err != nil {
		return fmt.Errorf("verify: open %s: %w", path, err)
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return fmt.Errorf("verify: hash %s: %w", path, err)
	}

	computed := hex.EncodeToString(h.Sum(nil))
	if !strings.EqualFold(computed, expectedHex) {
		return fmt.Errorf("verify: hash mismatch for %s\n  expected: %s\n  computed: %s",
			filepath.Base(path), expectedHex, computed)
	}

	v.log.Info("verify", "hash verified",
		logging.F("file", filepath.Base(path)),
		logging.F("sha256", computed[:16]+"..."),
	)
	return nil
}
