package download

import (
	"context"
	"fmt"
	"os"
	"sync"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/internal/manifest"
	"airframe-bootstrap/internal/progress"
	"airframe-bootstrap/pkg/httpclient"
)

const maxParallel = 4

// Result is the outcome of a single package download.
type Result struct {
	Package manifest.PackageEntry
	Path    string // final path on disk
	Err     error
}

// Manager downloads multiple packages concurrently.
type Manager interface {
	DownloadAll(ctx context.Context, packages []manifest.PackageEntry, stagingDir string) ([]Result, error)
}

type manager struct {
	client  *httpclient.Client
	log     logging.Logger
	emitter *progress.Emitter
}

// NewManager creates a Manager.
func NewManager(client *httpclient.Client, log logging.Logger, emitter *progress.Emitter) Manager {
	return &manager{client: client, log: log, emitter: emitter}
}

// DownloadAll downloads all packages in parallel (up to maxParallel concurrent).
// Returns an error if any individual download fails.
func (m *manager) DownloadAll(ctx context.Context, packages []manifest.PackageEntry, stagingDir string) ([]Result, error) {
	if err := os.MkdirAll(stagingDir, 0755); err != nil {
		return nil, fmt.Errorf("download: create staging dir: %w", err)
	}

	sem := make(chan struct{}, maxParallel)
	results := make([]Result, len(packages))
	var wg sync.WaitGroup

	for i, pkg := range packages {
		wg.Add(1)
		i, pkg := i, pkg // capture loop vars
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			m.emitter.Progress(progress.ProgressEvent{
				PackageID:  pkg.ID,
				BytesDone:  0,
				BytesTotal: pkg.SizeBytes,
				SpeedBps:   0,
			})

			w := &worker{
				pkg:     pkg,
				dir:     stagingDir,
				client:  m.client,
				log:     m.log,
				emitter: m.emitter,
			}
			path, err := w.run(ctx)
			results[i] = Result{Package: pkg, Path: path, Err: err}
		}()
	}

	wg.Wait()

	// Collect errors.
	for _, r := range results {
		if r.Err != nil {
			return results, fmt.Errorf("download: %s failed: %w", r.Package.ID, r.Err)
		}
	}
	return results, nil
}
