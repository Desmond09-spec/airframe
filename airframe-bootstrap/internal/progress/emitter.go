package progress

import (
	"context"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Emitter sends typed events to the React frontend via the Wails IPC bridge.
// It debounces per-package progress events to at most one per 100ms to avoid
// flooding the WebView2 channel.
type Emitter struct {
	ctx context.Context

	// Debounce state per package.
	mu        sync.Mutex
	lastEmit  map[string]time.Time
	debounce  time.Duration
}

// NewEmitter creates an Emitter bound to the Wails application context.
// The ctx must be the context passed to app.startup().
func NewEmitter(ctx context.Context) *Emitter {
	return &Emitter{
		ctx:      ctx,
		lastEmit: make(map[string]time.Time),
		debounce: 100 * time.Millisecond,
	}
}

// Phase emits a phase lifecycle event.
func (e *Emitter) Phase(phase PhaseID, status PhaseStatus, msg string) {
	runtime.EventsEmit(e.ctx, EventPhase, PhaseEvent{
		Phase:   phase,
		Status:  status,
		Message: msg,
	})
}

// Manifest emits the resolved package list.
func (e *Emitter) Manifest(packages []PackageInfo, totalBytes int64) {
	runtime.EventsEmit(e.ctx, EventManifest, ManifestLoadedEvent{
		Packages:   packages,
		TotalBytes: totalBytes,
	})
}

// Progress emits a per-package download progress event.
// Events are debounced to at most one per 100ms per package.
func (e *Emitter) Progress(ev ProgressEvent) {
	e.mu.Lock()
	last := e.lastEmit[ev.PackageID]
	now := time.Now()
	if now.Sub(last) < e.debounce {
		e.mu.Unlock()
		return
	}
	e.lastEmit[ev.PackageID] = now
	e.mu.Unlock()

	runtime.EventsEmit(e.ctx, EventProgress, ev)
}

// Error emits an error event.
func (e *Emitter) Error(ev ErrorEvent) {
	runtime.EventsEmit(e.ctx, EventError, ev)
}

// Done emits the installation-complete event.
func (e *Emitter) Done() {
	runtime.EventsEmit(e.ctx, EventDone, DoneEvent{
		LaunchedAt: time.Now().UTC().Format(time.RFC3339),
	})
}
