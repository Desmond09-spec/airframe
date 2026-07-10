package main

import (
	"context"
	"os"
	"path/filepath"
	"sync"
	"time"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/internal/manifest"
	"airframe-bootstrap/internal/orchestrator"
	"airframe-bootstrap/internal/progress"
	"airframe-bootstrap/pkg/platform"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App is the root Wails application struct.
// All methods on App are exposed to the frontend via the Wails binding layer.
type App struct {
	ctx     context.Context
	cancel  context.CancelFunc
	log     logging.Logger
	emitter *progress.Emitter
	orch    *orchestrator.Orchestrator

	manifestURL string
	logPath     string

	installMu  sync.Mutex
	installing bool
}

// newApp creates a new App instance.
func newApp() *App {
	return &App{}
}

// startup is called by Wails when the application starts.
// It wires up services — the orchestrator does NOT start here.
func (a *App) startup(ctx context.Context) {
	a.ctx, a.cancel = context.WithCancel(ctx)

	// Resolve log path.
	logPath, err := platform.LogFilePath()
	if err != nil {
		logPath = ""
	}
	a.logPath = logPath

	// Initialise logger.
	a.log = logging.New(logging.Config{
		MinLevel: logging.LevelInfo,
		FilePath: logPath,
	})

	a.log.Info("app", "airframe bootstrap starting",
		logging.F("pid", os.Getpid()),
		logging.F("time", time.Now().Format(time.RFC3339)),
	)

	// Initialise event emitter — binds to the Wails context.
	a.emitter = progress.NewEmitter(ctx)

	// Determine manifest URL.
	a.manifestURL = manifestSource()
	a.log.Info("app", "using manifest", logging.F("url", a.manifestURL))

	// Create orchestrator.
	a.orch = orchestrator.New(
		orchestrator.Config{ManifestURL: a.manifestURL},
		a.log,
		a.emitter,
	)
}

// domReady is called by Wails after the WebView DOM is fully ready.
// We pre-fetch the manifest here so the Welcome screen can show the
// package list before the user clicks Install.
func (a *App) domReady(ctx context.Context) {
	// Small extra delay to let React's useEffect event listeners register.
	time.Sleep(300 * time.Millisecond)

	go func() {
		pkgs, totalBytes, err := manifest.FetchResolved(a.ctx, a.manifestURL, a.log)
		if err != nil {
			a.log.Warn("app", "preflight manifest fetch failed", logging.F("err", err))
			return
		}

		// Convert manifest.PackageEntry → progress.PackageInfo for the event.
		infos := make([]progress.PackageInfo, len(pkgs))
		for i, p := range pkgs {
			infos[i] = progress.PackageInfo{
				ID:        p.ID,
				Name:      p.Name,
				Version:   p.Version,
				SizeBytes: p.SizeBytes,
			}
		}
		a.emitter.Manifest(infos, totalBytes)
	}()
}


// shutdown is called by Wails when the window closes.
func (a *App) shutdown(ctx context.Context) {
	if a.cancel != nil {
		a.cancel()
	}
	a.log.Info("app", "bootstrap shutdown")
}

// ──────────────────────────────────────────────────────────────────────────────
// Bound methods (callable from JavaScript via window.go.*)
// ──────────────────────────────────────────────────────────────────────────────

// StartInstall kicks off the full installation pipeline.
// It is idempotent — calling it a second time is a no-op.
func (a *App) StartInstall() {
	a.installMu.Lock()
	if a.installing {
		a.installMu.Unlock()
		return
	}
	a.installing = true
	a.installMu.Unlock()

	go a.orch.Run(a.ctx)
}

// GetInstallPath returns the target installation directory.
func (a *App) GetInstallPath() string {
	dir, err := platform.DashboardInstallDir()
	if err != nil {
		return ""
	}
	return dir
}

// GetLogPath returns the current log file path.
func (a *App) GetLogPath() string {
	return a.logPath
}

// Cancel cancels the installation pipeline.
func (a *App) Cancel() {
	if a.cancel != nil {
		a.cancel()
	}
}

// OpenLogFile opens the log file in the default text editor.
func (a *App) OpenLogFile() {
	if a.logPath != "" && a.ctx != nil {
		runtime.BrowserOpenURL(a.ctx, "file://"+a.logPath)
	}
}

// GetVersion returns the bootstrap binary version.
func (a *App) GetVersion() string {
	return Version
}

// ──────────────────────────────────────────────────────────────────────────────
// Manifest URL resolution
// ──────────────────────────────────────────────────────────────────────────────

// manifestSource returns the manifest URL, in priority order:
//  1. BOOTSTRAP_MANIFEST_URL environment variable (for testing / CI)
//  2. Compiled-in ManifestURL constant (set via -ldflags at release build time)
//  3. assets/manifest/stable.json relative to the executable (for production)
//  4. assets/manifest/stable.json relative to the current working directory (for dev)
func manifestSource() string {
	if env := os.Getenv("BOOTSTRAP_MANIFEST_URL"); env != "" {
		return env
	}
	if ManifestURL != "" {
		return ManifestURL
	}

	// Try relative to the running executable first (production).
	if exe, err := os.Executable(); err == nil {
		candidate := filepath.Join(filepath.Dir(exe), "assets", "manifest", "stable.json")
		if _, err := os.Stat(candidate); err == nil {
			return "file:///" + filepath.ToSlash(candidate)
		}
	}

	// Fallback: look in the current working directory (wails dev mode).
	if cwd, err := os.Getwd(); err == nil {
		candidate := filepath.Join(cwd, "assets", "manifest", "stable.json")
		if _, err := os.Stat(candidate); err == nil {
			return "file:///" + filepath.ToSlash(candidate)
		}
	}

	return ""
}
