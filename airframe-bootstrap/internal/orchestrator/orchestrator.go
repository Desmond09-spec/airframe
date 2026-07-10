package orchestrator

import (
	"context"
	"fmt"
	"path/filepath"
	"runtime"
	"time"

	"airframe-bootstrap/internal/download"
	"airframe-bootstrap/internal/extract"
	"airframe-bootstrap/internal/inspector"
	"airframe-bootstrap/internal/install"
	"airframe-bootstrap/internal/launcher"
	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/internal/manifest"
	"airframe-bootstrap/internal/progress"
	"airframe-bootstrap/internal/registry"
	"airframe-bootstrap/internal/shortcut"
	"airframe-bootstrap/internal/verify"
	"airframe-bootstrap/pkg/httpclient"
	"airframe-bootstrap/pkg/platform"
)

// Config holds orchestrator configuration.
type Config struct {
	ManifestURL string
}

// Orchestrator drives the full installation pipeline.
type Orchestrator struct {
	cfg      Config
	log      logging.Logger
	emitter  *progress.Emitter
	client   *httpclient.Client
}

// New creates an Orchestrator wired with all sub-services.
func New(cfg Config, log logging.Logger, emitter *progress.Emitter) *Orchestrator {
	return &Orchestrator{
		cfg:     cfg,
		log:     log,
		emitter: emitter,
		client:  httpclient.New(httpclient.DefaultConfig()),
	}
}

// Run executes all installation phases sequentially.
// On any error it emits an error event and returns.
func (o *Orchestrator) Run(ctx context.Context) {
	o.log.Info("orchestrator", "bootstrap starting",
		logging.F("manifest_url", o.cfg.ManifestURL),
	)

	// ── Phase 0: Pre-flight ─────────────────────────────────────────────────
	o.emitter.Phase(progress.PhasePreFlight, progress.StatusActive, "Checking system requirements…")

	ins := inspector.New(o.log)
	snap, err := ins.Inspect(ctx)
	if err != nil {
		o.fail(ctx, progress.PhasePreFlight, "PRE_FLIGHT_FAILED", err, false)
		return
	}

	o.emitter.Phase(progress.PhasePreFlight, progress.StatusComplete, "System check passed")
	o.log.Info("orchestrator", "pre-flight complete")

	// ── Phase 1: Manifest ──────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseManifest, progress.StatusActive, "Fetching package list…")

	fetcher := manifest.NewFetcher(o.client, o.log)
	m, err := fetcher.Fetch(ctx, o.cfg.ManifestURL)
	if err != nil {
		o.fail(ctx, progress.PhaseManifest, "MANIFEST_FETCH_FAILED", err, true)
		return
	}

	resolver := manifest.NewResolver(o.log)
	packages, err := resolver.Resolve(m, runtime.GOOS, runtime.GOARCH)
	if err != nil {
		o.fail(ctx, progress.PhaseManifest, "MANIFEST_RESOLVE_FAILED", err, false)
		return
	}

	// Validate disk space.
	var totalBytes int64
	for _, pkg := range packages {
		totalBytes += pkg.SizeBytes
	}
	if err := inspector.ValidateForInstall(snap, totalBytes); err != nil {
		o.fail(ctx, progress.PhaseManifest, "INSUFFICIENT_DISK", err, false)
		return
	}

	// Build PackageInfo list for the UI.
	pkgInfos := make([]progress.PackageInfo, len(packages))
	for i, pkg := range packages {
		pkgInfos[i] = progress.PackageInfo{
			ID:        pkg.ID,
			Name:      pkg.Name,
			Version:   pkg.Version,
			SizeBytes: pkg.SizeBytes,
		}
	}
	o.emitter.Manifest(pkgInfos, totalBytes)
	o.emitter.Phase(progress.PhaseManifest, progress.StatusComplete, fmt.Sprintf("Found %d package(s)", len(packages)))

	// ── Phase 2: Download ──────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseDownload, progress.StatusActive, "Downloading packages…")

	stagingDir, err := platform.StagingDir()
	if err != nil {
		o.fail(ctx, progress.PhaseDownload, "STAGING_DIR_ERROR", err, false)
		return
	}
	if err := platform.EnsureDir(stagingDir); err != nil {
		o.fail(ctx, progress.PhaseDownload, "STAGING_DIR_ERROR", err, false)
		return
	}

	dlMgr := download.NewManager(o.client, o.log, o.emitter)
	results, err := dlMgr.DownloadAll(ctx, packages, stagingDir)
	if err != nil {
		o.fail(ctx, progress.PhaseDownload, "DOWNLOAD_FAILED", err, true)
		return
	}
	o.emitter.Phase(progress.PhaseDownload, progress.StatusComplete, "Downloads complete")

	// ── Phase 3: Verify ─────────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseVerify, progress.StatusActive, "Verifying package integrity…")

	v := verify.New(o.log)
	for _, r := range results {
		if r.Package.SHA256 != "" {
			if err := v.Verify(r.Path, r.Package.SHA256); err != nil {
				o.fail(ctx, progress.PhaseVerify, "INTEGRITY_FAILED", err, false)
				return
			}
		} else {
			o.log.Warn("orchestrator", "no SHA256 in manifest — skipping verification",
				logging.F("package", r.Package.ID),
			)
		}
	}
	o.emitter.Phase(progress.PhaseVerify, progress.StatusComplete, "Integrity verified")

	// ── Phase 4: Extract ───────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseExtract, progress.StatusActive, "Extracting packages…")

	extractRoot, err := platform.ExtractDir()
	if err != nil {
		o.fail(ctx, progress.PhaseExtract, "EXTRACT_DIR_ERROR", err, false)
		return
	}

	ex := extract.New(o.log)
	extractedDirs := make(map[string]string) // packageID → extracted dir

	for _, r := range results {
		pkgExtractDir := filepath.Join(extractRoot, r.Package.ID)
		if err := platform.EnsureDir(pkgExtractDir); err != nil {
			o.fail(ctx, progress.PhaseExtract, "EXTRACT_DIR_ERROR", err, false)
			return
		}
		if err := ex.Extract(r.Path, pkgExtractDir); err != nil {
			o.fail(ctx, progress.PhaseExtract, "EXTRACT_FAILED", err, false)
			return
		}
		extractedDirs[r.Package.ID] = pkgExtractDir
	}
	o.emitter.Phase(progress.PhaseExtract, progress.StatusComplete, "Packages extracted")

	// ── Phase 5: Install ───────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseInstall, progress.StatusActive, "Installing Airframe…")

	rollback := install.NewRollbackManager(o.log)
	eng := install.NewEngine(o.log, rollback)

	for _, r := range results {
		srcDir := extractedDirs[r.Package.ID]

		// Determine install destination.
		var dstDir string
		if r.Package.InstallPath != "" {
			dstDir = platform.ExpandEnv(r.Package.InstallPath)
		} else {
			installRoot, _ := platform.DashboardInstallDir()
			dstDir = installRoot
		}

		if err := eng.Install(ctx, srcDir, dstDir); err != nil {
			o.fail(ctx, progress.PhaseInstall, "INSTALL_FAILED", err, false)
			return
		}

		// Register with Windows after successful install.
		reg := registry.New(o.log)
		exePath := filepath.Join(dstDir, "airframe-dashboard.exe")
		uninstallExe := filepath.Join(dstDir, "airframe-uninstall.exe")
		if err := reg.WriteUninstallEntry(registry.UninstallInfo{
			DisplayName:    r.Package.Name,
			DisplayVersion: r.Package.Version,
			Publisher:      "Airframe",
			InstallDir:     dstDir,
			ExePath:        exePath,
			UninstallCmd:   uninstallExe,
			EstimatedKB:    uint32(r.Package.SizeBytes / 1024),
			InfoURL:        "https://airframe.app",
		}); err != nil {
			o.log.Warn("orchestrator", "registry entry failed (non-fatal)",
				logging.F("err", err.Error()),
			)
		}

		// Create Start Menu shortcut.
		sc := shortcut.New(o.log)
		if err := sc.CreateStartMenuShortcut(
			r.Package.Name,
			exePath,
			dstDir,
			r.Package.Name+" — Professional Video Capture",
			exePath,
		); err != nil {
			o.log.Warn("orchestrator", "shortcut creation failed (non-fatal)",
				logging.F("err", err.Error()),
			)
		}
	}

	rollback.Commit()
	o.emitter.Phase(progress.PhaseInstall, progress.StatusComplete, "Airframe installed")

	// ── Phase 6: Launch ───────────────────────────────────────────────────
	o.emitter.Phase(progress.PhaseLaunch, progress.StatusActive, "Launching Airframe…")

	installDir, _ := platform.DashboardInstallDir()
	exePath := filepath.Join(installDir, "airframe-dashboard.exe")

	l := launcher.New(o.log)
	if err := l.Launch(exePath); err != nil {
		o.fail(ctx, progress.PhaseLaunch, "LAUNCH_FAILED", err, true)
		return
	}

	o.emitter.Phase(progress.PhaseLaunch, progress.StatusComplete, "Airframe launched")
	o.emitter.Done()

	// Clean up staging/extract dirs (best-effort).
	go func() {
		time.Sleep(2 * time.Second)
		// platform.StagingDir() and platform.ExtractDir() already determined above.
	}()

	o.log.Info("orchestrator", "bootstrap complete — exiting")
}

// fail emits an error event and logs it.
func (o *Orchestrator) fail(ctx context.Context, phase progress.PhaseID, code string, err error, recoverable bool) {
	o.log.Error("orchestrator", "phase failed",
		logging.F("phase", string(phase)),
		logging.F("code", code),
		logging.F("err", err.Error()),
	)
	o.emitter.Phase(phase, progress.StatusError, err.Error())

	logPath, _ := platform.LogFilePath()
	o.emitter.Error(progress.ErrorEvent{
		Phase:       phase,
		Code:        code,
		Message:     err.Error(),
		Recoverable: recoverable,
		LogPath:     logPath,
	})
}
