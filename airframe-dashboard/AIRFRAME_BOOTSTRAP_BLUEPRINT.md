# Airframe Bootstrap — Engineering Blueprint

**Classification**: Internal Engineering Reference  
**Audience**: Senior Software Engineers  
**Version**: 1.0.0  
**Project**: Airframe Bootstrap  
**Author**: Systems Architecture  
**Last Updated**: 2026-07-10  

---

> This document is an engineering specification.  
> It is not a README, not marketing material, and not end-user documentation.  
> A senior software engineer with no prior context should be able to reconstruct this system from this document alone, five years from now.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Vision](#2-vision)
3. [Goals](#3-goals)
4. [Non-Goals](#4-non-goals)
5. [Design Principles](#5-design-principles)
6. [Engineering Principles](#6-engineering-principles)
7. [User Experience Principles](#7-user-experience-principles)
8. [High-Level Architecture](#8-high-level-architecture)
9. [System Components](#9-system-components)
10. [Execution Lifecycle](#10-execution-lifecycle)
11. [Bootstrap Lifecycle](#11-bootstrap-lifecycle)
12. [Component Responsibilities](#12-component-responsibilities)
13. [Folder Structure](#13-folder-structure)
14. [Repository Structure](#14-repository-structure)
15. [Frontend Architecture](#15-frontend-architecture)
16. [Backend Architecture](#16-backend-architecture)
17. [Go Package Layout](#17-go-package-layout)
18. [React Project Layout](#18-react-project-layout)
19. [State Management](#19-state-management)
20. [Dependency Graph](#20-dependency-graph)
21. [Installation Pipeline](#21-installation-pipeline)
22. [Runtime Detection](#22-runtime-detection)
23. [Environment Inspection](#23-environment-inspection)
24. [Download Manager](#24-download-manager)
25. [Package Manifest Design](#25-package-manifest-design)
26. [Version Resolution](#26-version-resolution)
27. [Integrity Verification](#27-integrity-verification)
28. [SHA-256 Verification](#28-sha-256-verification)
29. [Digital Signature Verification (Future)](#29-digital-signature-verification-future)
30. [Package Extraction](#30-package-extraction)
31. [Installer Engine](#31-installer-engine)
32. [Rollback Strategy](#32-rollback-strategy)
33. [Atomic Installation](#33-atomic-installation)
34. [Shortcut Creation](#34-shortcut-creation)
35. [Registry Management](#35-registry-management)
36. [File Associations](#36-file-associations)
37. [Uninstall Registration](#37-uninstall-registration)
38. [Logging](#38-logging)
39. [Error Handling](#39-error-handling)
40. [Recovery Strategy](#40-recovery-strategy)
41. [Security Model](#41-security-model)
42. [Threading Model](#42-threading-model)
43. [Concurrency](#43-concurrency)
44. [Progress Reporting](#44-progress-reporting)
45. [Communication Between Components](#45-communication-between-components)
46. [Launching Airframe](#46-launching-airframe)
47. [Why Bootstrap Exits](#47-why-bootstrap-exits)
48. [Relationship with Airframe Updater](#48-relationship-with-airframe-updater)
49. [Update Architecture](#49-update-architecture)
50. [Release Pipeline](#50-release-pipeline)
51. [GitHub Releases Strategy](#51-github-releases-strategy)
52. [CI/CD](#52-cicd)
53. [Testing Strategy](#53-testing-strategy)
54. [Design System](#54-design-system)
55. [UI Architecture](#55-ui-architecture)
56. [Animation Principles](#56-animation-principles)
57. [Accessibility](#57-accessibility)
58. [Future Evolution](#58-future-evolution)
59. [Airframe Hub](#59-airframe-hub)
60. [Plugin Installation](#60-plugin-installation)
61. [Component Installer](#61-component-installer)
62. [Package Manager Vision](#62-package-manager-vision)
63. [Risks](#63-risks)
64. [Tradeoffs](#64-tradeoffs)
65. [Technical Decisions](#65-technical-decisions)
66. [Engineering Invariants](#66-engineering-invariants)
67. [Roadmap](#67-roadmap)
68. [Appendix](#68-appendix)
69. [Glossary](#69-glossary)

---

## 1. Philosophy

Airframe is built around a layered, independently-evolvable architecture. Every layer in the Airframe stack has exactly one responsibility:

```
Capture     ->  records video from hardware
Transport   ->  moves encoded frames over the network
Processing  ->  decodes and prepares frames
Rendering   ->  presents frames to a display or virtual output
Receiver    ->  accepts stream input from capture devices
```

Each layer is independently deployable, independently upgradeable, and independently replaceable. No layer depends on another layer's implementation details — only its interface contract.

Bootstrap must follow the same philosophy without exception.

Bootstrap is not an installer in the traditional Windows-installer sense. It is not a setup.exe that extracts a zip and calls it done. It is the **entry point into the Airframe ecosystem** — a one-time setup program that prepares a machine, downloads the correct components, verifies their integrity, installs them, registers them with the operating system, and hands control to Airframe's own Updater.

The moment Airframe is launched successfully, Bootstrap's job is over. It exits. It does not linger. It does not phone home. It does not check for updates on behalf of Airframe. It becomes irrelevant.

This philosophy is enforced architecturally: Bootstrap has no update mechanism for Airframe itself. That responsibility belongs entirely to the Airframe Updater, which is one of the components Bootstrap installs.

---

## 2. Vision

Airframe Bootstrap should feel like the first experience a professional receives when they choose Airframe. It sets the tone. It communicates quality, reliability, and craft — before the main application has even been opened.

The long-term vision is for Bootstrap to evolve into the **Airframe Hub**: a persistent, trusted entry point that manages every Airframe component on a user's machine. This future state includes plugin management, component repair, SDK downloads, and update orchestration across the entire Airframe ecosystem.

Bootstrap's architecture today must make that evolution possible without requiring a rewrite. Every design decision should be evaluated against this question: *"Will this decision constrain the Hub, or enable it?"*

---

## 3. Goals

- Prepare the host machine for Airframe installation.
- Detect the operating system, architecture, and runtime environment.
- Fetch the Airframe package manifest from a known, authenticated endpoint.
- Resolve the correct package versions for the current environment.
- Download all required packages with resumable, parallel transfers.
- Verify every downloaded package using SHA-256.
- Extract packages into a staging directory.
- Install packages atomically, with rollback on failure.
- Register Airframe with the Windows registry (Add/Remove Programs, file associations, shortcuts).
- Launch Airframe.
- Exit cleanly.
- Produce structured logs throughout for diagnostics.
- Support silent (headless) installation for enterprise deployments.

---

## 4. Non-Goals

Bootstrap is **not** responsible for:

- Performing post-installation updates to Airframe. (Owned by: Airframe Updater)
- Communicating with Airframe after launch. (No IPC bridge exists between Bootstrap and Airframe)
- Managing plugins or extensions. (Future: Airframe Hub)
- Providing a persistent background service. (Bootstrap exits after launch)
- Licensing enforcement. (Future: Airframe licensing subsystem)
- Network diagnostics for WebRTC streaming. (Owned by: Airframe Dashboard)
- Configuration of Airframe settings. (Owned by: Airframe Dashboard)
- SDK installations for capture devices. (Future: Airframe Hub)

---

## 5. Design Principles

**Minimal surface area.** Bootstrap should do exactly what is required for installation and nothing more. Feature creep in a bootstrapper is dangerous; every additional responsibility is a potential failure mode.

**Fail fast, fail clearly.** If the environment is unsuitable or a download fails permanently, Bootstrap must report the failure clearly and exit with a non-zero code. Silent failures are worse than loud failures.

**Never corrupt the machine.** Installation must be atomic. If any stage fails after committing to disk, Bootstrap must roll back to the pre-installation state. A partial install is worse than no install.

**Predictable behaviour.** Given the same environment and the same manifest, Bootstrap should produce the same result every time. Installation should be deterministic.

**Respect the user.** The installer UI should communicate exactly what is happening, why it is happening, and what the user should do if something goes wrong. No vague spinners, no silent progress.

**Platform-native where it matters.** Shortcuts, registry entries, file associations — these must follow Windows conventions exactly. A non-standard installation is a source of support tickets.

**Separation of mechanism and policy.** The download subsystem does not know what it is downloading. The integrity verifier does not know how the package will be installed. Each subsystem receives well-typed inputs and returns well-typed outputs.

---

## 6. Engineering Principles

**Single Responsibility.** Every Go package has one job. Every React component has one job. This is enforced by code review and articulated explicitly in this document.

**Explicit over implicit.** Configuration is never inferred from ambient globals. Every subsystem receives its configuration through constructor injection or typed options. There are no package-level globals carrying state between subsystems.

**Interfaces at boundaries.** Every subsystem that communicates with another exposes an interface, not a concrete type. This makes testing trivial (mock the interface), makes subsystem replacement safe (swap the implementation), and makes the dependency graph explicit.

**Error wrapping with context.** Errors in Go are always wrapped with `fmt.Errorf("component: %w", err)` so the call stack is preserved in log output without stack traces. This produces human-readable error chains that are invaluable in production support.

**Structured logging from day one.** All logs are emitted as structured JSON at defined severity levels. No `fmt.Println`. No `log.Printf` with free-form strings. Every log entry carries a component field, a level, a timestamp, and any relevant context.

**Idempotent operations.** Every stage in the installation pipeline must be safely re-runnable. If Bootstrap is interrupted mid-installation and restarted, it should detect where it left off and continue rather than restart from scratch.

**No shared mutable state between goroutines without a mutex.** All concurrent access to shared data is protected. Channels are preferred for communication; mutexes for guarding state.

**Dependency injection at the application root.** Dependencies are constructed at `main()` and passed downward. Nothing constructs its own dependencies internally.

---

## 7. User Experience Principles

**The UI is a status display, not a control panel.** The user does not drive the installation. They watch it proceed. The only control surfaces available are: Cancel (at appropriate stages) and Retry (on recoverable error).

**Progress is always meaningful.** Every progress indicator reflects real work. There are no fake progress bars that fill themselves on a timer. If we don't know how long something will take, we show an indeterminate indicator and explain what is happening in text.

**Language is clear and non-technical.** Error messages are written in plain English. The user does not need to understand what "SHA-256 mismatch" means; they need to know what to do next. Technical details are available in the log file and behind an expandable "Details" disclosure.

**The UI matches Airframe.** Bootstrap must feel like it was made by the same people who made Airframe. It uses the same type scale, the same spacing system, the same color palette, and the same design language.

**No modal dialogs.** Every state transition (error, warning, confirmation) is handled inline in the UI, not via a popup dialog box.

**Sound off.** No audio. No system sounds. No notifications until the installation is complete.

---

## 8. High-Level Architecture

Bootstrap is a Wails desktop application: a Go binary embedding a React frontend served in a WebView2 window. The Go backend performs all system operations. The frontend renders progress and state. Communication between them flows through the Wails runtime binding system.

```
+-------------------------------------------------------------+
|                    Bootstrap Process                        |
|                                                             |
|  +------------------+      +----------------------------+   |
|  |  React Frontend  |<---->|      Go Backend            |   |
|  |  (WebView2)      |      |                            |   |
|  |                  |      |  +----------------------+  |   |
|  |  InstallView     |      |  | Orchestrator         |  |   |
|  |  ProgressView    |      |  | DownloadManager      |  |   |
|  |  ErrorView       |      |  | IntegrityVerifier    |  |   |
|  |  CompleteView    |      |  | PackageExtractor     |  |   |
|  |                  |      |  | InstallerEngine      |  |   |
|  +------------------+      |  | RegistryManager      |  |   |
|                            |  | LaunchController     |  |   |
|                            |  +----------------------+  |   |
|                            +----------------------------+   |
+-------------------------------------------------------------+
                            |
                            v
                    +---------------+
                    | Airframe.exe  |  (launched by Bootstrap)
                    +---------------+
```

All system calls, file I/O, network operations, and registry writes happen in Go. The React frontend is purely presentational: it receives state from Go via Wails events and renders it.

---

## 9. System Components

| Component | Layer | Responsibility |
|---|---|---|
| `Orchestrator` | Go | Drives the installation pipeline; coordinates all other subsystems |
| `EnvironmentInspector` | Go | Detects OS version, architecture, installed runtimes |
| `ManifestFetcher` | Go | Downloads and parses the remote package manifest |
| `VersionResolver` | Go | Selects the correct package version for the environment |
| `DownloadManager` | Go | Downloads packages with resumability, concurrency, and progress |
| `IntegrityVerifier` | Go | Verifies SHA-256 hashes of downloaded packages |
| `PackageExtractor` | Go | Extracts zip archives into staging directories |
| `InstallerEngine` | Go | Moves staged files to their final install locations |
| `RollbackManager` | Go | Tracks installed files and reverts to prior state on failure |
| `RegistryManager` | Go | Writes Windows registry entries |
| `ShortcutCreator` | Go | Creates Start Menu and Desktop shortcuts |
| `LaunchController` | Go | Launches Airframe.exe after successful installation |
| `ProgressEmitter` | Go | Emits structured progress events to the frontend via Wails |
| `Logger` | Go | Structured logging to file and stdout |
| `InstallView` | React | Renders active installation state and per-step progress |
| `ErrorView` | React | Renders recoverable and fatal error states |
| `CompleteView` | React | Renders the successful completion screen |
| `ProgressBar` | React | Animated progress indicator component |
| `StepList` | React | Ordered list of installation steps with status indicators |
| `useBootstrapState` | React | Hook that subscribes to Wails events and builds UI state |

---

## 10. Execution Lifecycle

From the user's perspective:

```
 1. User double-clicks Airframe Bootstrap.exe
 2. A frameless window appears immediately
 3. The UI shows: "Preparing your machine for Airframe"
 4. Environment inspection runs (~100ms)
 5. Manifest is fetched from the release endpoint (~200ms)
 6. Package list is displayed with sizes
 7. Downloads begin, with per-package progress
 8. Each package is verified after download
 9. Packages are extracted to a staging directory
10. Atomic installation runs: staged files moved to final location
11. Registry entries, shortcuts, uninstall entries are written
12. "Airframe is ready. Launching now." appears
13. Airframe.exe is launched as a detached process
14. Bootstrap exits with code 0
```

---

## 11. Bootstrap Lifecycle

```
main()
  +- NewApp()
       +- app.startup(ctx)
            +- orchestrator.Run(ctx)
                 |
                 +- Phase 0: Pre-flight
                 |    +- inspector.Inspect()           -> EnvironmentSnapshot
                 |    +- emit(PhaseStarted{phase: "preflight"})
                 |
                 +- Phase 1: Manifest
                 |    +- fetcher.Fetch(manifestURL)    -> Manifest
                 |    +- resolver.Resolve(snap, mfst)  -> PackageList
                 |    +- emit(ManifestLoaded{...})
                 |
                 +- Phase 2: Download
                 |    +- manager.DownloadAll(packages, stagingDir)
                 |    |    +- [parallel] download pkg A -> progress events
                 |    |    +- [parallel] download pkg B -> progress events
                 |    +- emit(DownloadsComplete{})
                 |
                 +- Phase 3: Verification
                 |    +- verifier.VerifyAll(packages, stagingDir)
                 |    +- emit(VerificationComplete{})
                 |
                 +- Phase 4: Extraction
                 |    +- extractor.ExtractAll(packages, stagingDir, extractDir)
                 |    +- emit(ExtractionComplete{})
                 |
                 +- Phase 5: Installation
                 |    +- engine.Install(extractDir, installDir, rollbackMgr)
                 |    +- registry.WriteAll(installDir)
                 |    +- shortcuts.CreateAll(installDir)
                 |    +- emit(InstallComplete{})
                 |
                 +- Phase 6: Launch
                      +- launcher.Launch(installDir)
                      +- emit(Launched{})
                      +- app.Exit()
```

Every phase emits structured events. If any phase returns an error, the orchestrator emits an error event, invokes the RollbackManager if appropriate, and transitions the UI to an error state.

---

## 12. Component Responsibilities

### Orchestrator

The Orchestrator is the only component that has a view of the entire pipeline. It does not perform any individual operation itself — it sequences them, handles errors, and coordinates rollback.

The Orchestrator owns: installation state machine, phase transitions, rollback invocation, top-level error handling.

The Orchestrator does **not** own: how packages are downloaded, how hashes are verified, how files are moved.

### DownloadManager

The DownloadManager is responsible for network I/O only. It knows how to open an HTTP range request, write chunks to a staging file, resume an interrupted download using a `.partial` file, and report bytes downloaded vs. total per-package.

The DownloadManager does **not** know: what the downloaded file will be used for, whether the hash is correct, where the file will ultimately be installed.

### IntegrityVerifier

The IntegrityVerifier opens a file and computes its SHA-256 hash. It compares the computed hash against the expected hash from the manifest. If they do not match, it returns an error. It has no other responsibilities.

### InstallerEngine

The InstallerEngine moves files from the staging/extraction directory to the final installation directory. It does so atomically by registering each planned operation with the RollbackManager before executing, then atomically swapping files into place using OS-level move operations.

### RegistryManager

On Windows, the RegistryManager writes to:
- `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Airframe`
- `HKCU\SOFTWARE\Airframe`
- Any file association keys required for Airframe project files

It uses `golang.org/x/sys/windows/registry` directly, not `os/exec` with `reg.exe`.

---

## 13. Folder Structure

The internal folder layout of a running Bootstrap installation:

```
%LOCALAPPDATA%\Airframe\
+-- bootstrap\
|   +-- logs\
|   |   +-- bootstrap-2026-07-10.log
|   +-- staging\
|   |   +-- airframe-dashboard-1.0.0.zip
|   |   +-- airframe-dashboard-1.0.0.zip.partial
|   |   +-- airframe-updater-1.0.0.zip
|   +-- extract\
|       +-- airframe-dashboard\
|       +-- airframe-updater\
|
+-- airframe-dashboard\
|   +-- airframe-dashboard.exe
|   +-- WebView2Loader.dll
|   +-- resources\
|
+-- airframe-updater\
    +-- airframe-updater.exe
```

The `staging/` and `extract/` directories are cleaned up after successful installation. They are retained on failure for diagnostic purposes.

---

## 14. Repository Structure

```
airframe-bootstrap/
|
+-- apps/
|   +-- bootstrap/
|       +-- main.go          # Wails entry point
|       +-- app.go           # App struct; wails lifecycle hooks
|       +-- wails.json       # Wails configuration
|
+-- internal/
|   +-- orchestrator/
|   |   +-- orchestrator.go
|   |   +-- orchestrator_test.go
|   +-- inspector/
|   |   +-- inspector.go     # Environment detection
|   |   +-- snapshot.go      # EnvironmentSnapshot type
|   |   +-- inspector_test.go
|   +-- manifest/
|   |   +-- fetcher.go       # HTTP manifest download + parse
|   |   +-- manifest.go      # Manifest and Package types
|   |   +-- resolver.go      # Version resolution logic
|   |   +-- manifest_test.go
|   +-- download/
|   |   +-- manager.go       # Download orchestration
|   |   +-- worker.go        # Per-package download worker
|   |   +-- resume.go        # .partial file resume logic
|   |   +-- manager_test.go
|   +-- verify/
|   |   +-- verifier.go      # SHA-256 verification
|   |   +-- verifier_test.go
|   +-- extract/
|   |   +-- extractor.go     # zip extraction
|   |   +-- extractor_test.go
|   +-- install/
|   |   +-- engine.go        # File installation
|   |   +-- rollback.go      # Rollback manager
|   |   +-- engine_test.go
|   +-- registry/
|   |   +-- manager.go       # Windows registry writer
|   |   +-- manager_test.go
|   +-- shortcut/
|   |   +-- creator.go       # Shortcut creation (Windows)
|   |   +-- creator_test.go
|   +-- launcher/
|   |   +-- launcher.go      # Process launch + detach
|   |   +-- launcher_test.go
|   +-- progress/
|   |   +-- emitter.go       # Wails event emitter
|   |   +-- events.go        # Typed event definitions
|   +-- logging/
|       +-- logger.go        # Structured logger
|       +-- sinks.go         # File + stdout sinks
|
+-- pkg/
|   +-- platform/
|   |   +-- windows.go       # Windows-specific helpers
|   |   +-- paths.go         # Platform-aware path resolution
|   |   +-- platform_test.go
|   +-- httpclient/
|       +-- client.go        # Configured http.Client with retries
|       +-- client_test.go
|
+-- frontend/
|   +-- src/
|   |   +-- main.tsx
|   |   +-- App.tsx
|   |   +-- index.css        # Design tokens + global styles
|   |   +-- hooks/
|   |   |   +-- useBootstrapState.ts
|   |   |   +-- useProgress.ts
|   |   +-- components/
|   |   |   +-- StepList.tsx
|   |   |   +-- ProgressBar.tsx
|   |   |   +-- PhaseCard.tsx
|   |   |   +-- ErrorView.tsx
|   |   |   +-- CompleteView.tsx
|   |   +-- views/
|   |   |   +-- WelcomeView.tsx
|   |   |   +-- InstallView.tsx
|   |   |   +-- DoneView.tsx
|   |   +-- types/
|   |       +-- events.ts    # TypeScript mirror of Go event types
|   +-- package.json
|   +-- tsconfig.json
|   +-- vite.config.ts
|
+-- assets/
|   +-- icons/
|   |   +-- airframe.ico
|   |   +-- airframe.png
|   +-- manifest/
|       +-- schema.json
|
+-- scripts/
|   +-- build.ps1
|   +-- sign.ps1
|   +-- release.ps1
|
+-- docs/
|   +-- AIRFRAME_BOOTSTRAP_BLUEPRINT.md   (this document)
|   +-- MANIFEST_FORMAT.md
|   +-- REGISTRY_SCHEMA.md
|
+-- tools/
|   +-- manifest-gen/
|       +-- main.go          # CLI: generate release manifests
|
+-- tests/
    +-- integration/
    |   +-- download_test.go
    |   +-- install_test.go
    +-- e2e/
        +-- full_install_test.go
```

**Why this structure?**

- `internal/` enforces Go's package visibility rule: no external package can import `internal/` without being inside the module. Bootstrap's subsystems are not a public library.
- `pkg/` contains genuinely reusable primitives (`httpclient`, `platform`) that could be shared across future Airframe tools without modification.
- `apps/bootstrap/` isolates the Wails entry point. If Bootstrap is ever ported to a different shell (e.g., a CLI-only headless installer), the `internal/` packages remain unchanged.
- `tools/manifest-gen/` is a separate CLI tool used by the release pipeline to generate the manifest JSON that Bootstrap downloads.

---

## 15. Frontend Architecture

The Bootstrap frontend is a React + TypeScript application compiled by Vite and served inside a WebView2 window via Wails.

**Why React?**
The existing Airframe Dashboard is already built on React 19 + TypeScript + Tailwind CSS v4. Bootstrap must visually match the Dashboard. Using the same stack ensures shared design system tokens, fonts, and components — and the same mental model for engineers working across both products.

**Why Wails for the desktop shell?**
Wails provides a native WebView2 window with a Go backend and a clean IPC mechanism for calling Go functions from TypeScript and emitting Go events to TypeScript. It avoids the Electron overhead (~150MB runtime) while providing the native performance characteristics that a one-time installer demands.

The Bootstrap window is 520x640 pixels, frameless, non-resizable, and centered on screen. It has no titlebar, no maximize button, and a custom drag region at the top.

```
+---------------------------------+  ^
|  [drag region]            [x]  |  28px
+---------------------------------+
|                                 |
|      [AF]  Airframe             |  64px brand header
|                                 |
+---------------------------------+
|                                 |
|   Installing Airframe Dashboard |
|                                 |
|   ################....  62%     |  Progress bar
|                                 |
|   v  Environment check          |  Step list
|   v  Fetching manifest          |
|   *  Downloading packages       |  <- active
|   o  Verifying                  |
|   o  Installing                 |
|   o  Registering                |
|                                 |
|   airframe-dashboard-1.0.0.zip  |
|   48.2 MB of 78.4 MB            |
|                                 |
+---------------------------------+  ^
|         [Cancel]                |  48px footer
+---------------------------------+
```

---

## 16. Backend Architecture

The Go backend owns all system-level operations. It is structured as a collection of single-responsibility services injected into an Orchestrator.

The application root (`app.go`) constructs every service in dependency order and provides them to the Orchestrator. No service constructs its own dependencies.

```go
// Dependency construction order at app.startup()
func (a *App) startup(ctx context.Context) {
    a.ctx = ctx

    logger     := logging.New(logging.Config{Level: "info", File: logPath()})
    http       := httpclient.New(httpclient.Config{Timeout: 30*time.Second, RetryMax: 3})
    inspector  := inspector.New(logger)
    fetcher    := manifest.NewFetcher(http, logger)
    resolver   := manifest.NewResolver(logger)
    downloader := download.NewManager(http, logger, stagingDir())
    verifier   := verify.New(logger)
    extractor  := extract.New(logger)
    rollback   := install.NewRollbackManager(logger)
    engine     := install.NewEngine(logger, rollback)
    registry   := registry.New(logger)
    shortcuts  := shortcut.New(logger)
    launcher   := launcher.New(logger)
    emitter    := progress.NewEmitter(ctx)

    orchestrator := orchestrator.New(orchestrator.Config{
        Logger:     logger,
        Inspector:  inspector,
        Fetcher:    fetcher,
        Resolver:   resolver,
        Downloader: downloader,
        Verifier:   verifier,
        Extractor:  extractor,
        Engine:     engine,
        Rollback:   rollback,
        Registry:   registry,
        Shortcuts:  shortcuts,
        Launcher:   launcher,
        Emitter:    emitter,
    })

    go orchestrator.Run(ctx)
}
```

Every argument is an interface. `inspector.New()` returns a value that satisfies `orchestrator.Inspector`. This makes each subsystem independently testable with a mock.

---

## 17. Go Package Layout

Each package exposes exactly one public interface and one constructor. Internal types stay unexported.

```go
// internal/inspector/
type Inspector interface {
    Inspect(ctx context.Context) (Snapshot, error)
}

type Snapshot struct {
    OS              string    // "windows"
    Arch            string    // "amd64", "arm64"
    OSBuildNumber   uint32
    OSVersionString string    // "Windows 11 22H2"
    IsAdmin         bool
    HasWebView2     bool
    WebView2Version string
    TotalDiskBytes  uint64
    FreeDiskBytes   uint64
    TempDir         string
    InstallDir      string
    StagingDir      string
    LogPath         string
    InspectedAt     time.Time
}

// internal/manifest/
type Fetcher interface {
    Fetch(ctx context.Context, url string) (Manifest, error)
}

type Resolver interface {
    Resolve(snap inspector.Snapshot, m Manifest) ([]Package, error)
}

type Manifest struct {
    SchemaVersion string
    Packages      []PackageEntry
}

type PackageEntry struct {
    ID          string
    Name        string
    Version     string
    Platform    string
    Arch        string
    URL         string
    SHA256      string
    SizeBytes   int64
    Required    bool
    InstallPath string
}

// internal/download/
type Manager interface {
    DownloadAll(ctx context.Context, packages []Package, dir string) error
    Progress() <-chan DownloadProgress
}

// internal/verify/
type Verifier interface {
    Verify(path string, expected string) error
}

// internal/extract/
type Extractor interface {
    Extract(src string, dst string) error
}

// internal/install/
type Engine interface {
    Install(ctx context.Context, src string, dst string) error
}

type RollbackManager interface {
    Record(original string, backup string)
    Rollback() error
    Commit()
}

// internal/registry/
type Manager interface {
    WriteUninstallEntry(info UninstallInfo) error
    WriteFileAssociations(ext string, progID string) error
    DeleteAll(info UninstallInfo) error
}

// internal/shortcut/
type Creator interface {
    CreateStartMenu(target string, name string) error
    CreateDesktop(target string, name string) error
}

// internal/launcher/
type Launcher interface {
    Launch(executablePath string) error
}

// internal/progress/
type Emitter interface {
    Emit(event Event)
}
```

---

## 18. React Project Layout

```
frontend/src/
|
+-- main.tsx                    # React DOM root
+-- App.tsx                     # Root component; view router
+-- index.css                   # Design tokens, global reset
|
+-- hooks/
|   +-- useBootstrapState.ts    # Primary state hook
|   +-- useProgress.ts          # Derived: overall % from per-package progress
|
+-- components/
|   +-- ProgressBar.tsx         # Animated progress bar
|   +-- StepList.tsx            # Ordered step indicator with status icons
|   +-- PhaseCard.tsx           # Per-phase expanded detail card
|   +-- PackageRow.tsx          # Per-package download progress row
|   +-- SpeedBadge.tsx          # Transfer speed display
|   +-- ErrorView.tsx           # Inline error state with retry
|   +-- CompleteView.tsx        # Success state
|
+-- views/
|   +-- WelcomeView.tsx         # Pre-install: package list + Install button
|   +-- InstallView.tsx         # Active installation state
|   +-- DoneView.tsx            # Post-install state
|
+-- types/
    +-- events.ts               # Mirror of Go event types
```

**Component contract rules:**

1. A `view` receives no props from a parent. It reads from `useBootstrapState`.
2. A `component` receives all data via props. It has no side effects.
3. A `hook` contains all business logic and event subscriptions.
4. No view imports another view.
5. No component imports a view.

---

## 19. State Management

Bootstrap's frontend state is simple enough that no external state library is warranted. State lives in `useBootstrapState`, a single custom hook.

```typescript
// types/events.ts
export type PhaseId =
  | 'preflight' | 'manifest' | 'download'
  | 'verify' | 'extract' | 'install' | 'launch';

export type PhaseStatus = 'pending' | 'active' | 'complete' | 'error';

export interface PhaseEvent {
  phase: PhaseId;
  status: PhaseStatus;
  message?: string;
}

export interface PackageProgressEvent {
  packageId: string;
  bytesDone: number;
  bytesTotal: number;
  speedBps: number;
}

export interface ErrorEvent {
  phase: PhaseId;
  code: string;
  message: string;
  recoverable: boolean;
  logPath: string;
}

// hooks/useBootstrapState.ts
export interface BootstrapState {
  phase: PhaseId;
  phases: Record<PhaseId, PhaseStatus>;
  packages: Record<string, PackageProgressEvent>;
  error: ErrorEvent | null;
  done: boolean;
}
```

`useBootstrapState` subscribes to Wails `EventsOn` listeners on mount, accumulates events into local state via `useReducer`, and tears down listeners on unmount. No global state, no external state library.

---

## 20. Dependency Graph

The Go dependency graph is explicitly acyclic. This is enforced by Go's compiler (circular imports are a compile error) and by design.

```
main
  +- orchestrator
       +- inspector       (no deps on other internal packages)
       +- manifest
       |    +- httpclient (pkg/)
       +- download
       |    +- httpclient (pkg/)
       +- verify          (no network deps)
       +- extract         (no network deps)
       +- install
       |    +- platform   (pkg/)
       +- registry
       |    +- platform   (pkg/)
       +- shortcut
       |    +- platform   (pkg/)
       +- launcher        (no deps on other internal packages)
       +- progress        (no deps on other internal packages)
       +- logging         (no deps on other internal packages)
```

`orchestrator` is the only package that imports multiple `internal/` packages. No other `internal/` package imports another. `pkg/` packages may only import the Go standard library or well-audited third-party packages.

---

## 21. Installation Pipeline

The installation pipeline is a linear sequence of phases. Each phase receives typed input and produces typed output.

```
Phase 0: Pre-flight
  Input:  none
  Output: EnvironmentSnapshot
  Checks:
    - OS version >= Windows 10 (build 17763+)
    - Architecture: amd64 or arm64
    - WebView2 presence (Bootstrap installs if missing)
    - Available disk space >= required bytes + 20% buffer
    - Admin rights (prompt UAC if needed)
    - Network connectivity (simple HTTP HEAD to manifest URL)

Phase 1: Manifest
  Input:  EnvironmentSnapshot
  Output: []Package (resolved for current platform/arch)
  Steps:
    - Download manifest JSON from release endpoint
    - Validate against schema
    - Resolve versions for current environment

Phase 2: Download
  Input:  []Package, stagingDir
  Output: []DownloadedPackage (paths on disk)
  Steps:
    - Launch N parallel workers (N = min(4, len(packages)))
    - Each worker: open range request, write chunks, emit progress
    - On disconnection: resume from last byte

Phase 3: Verification
  Input:  []DownloadedPackage
  Output: []VerifiedPackage (or error)
  Steps:
    - For each package: compute SHA-256, compare to manifest hash
    - Fail entire phase if any hash mismatches

Phase 4: Extraction
  Input:  []VerifiedPackage, extractDir
  Output: []ExtractedPackage (paths on disk)
  Steps:
    - Determine archive type from extension
    - Extract to extractDir/packageID/
    - Validate extracted file tree against manifest

Phase 5: Installation
  Input:  []ExtractedPackage, installDir
  Output: InstallResult
  Steps:
    - For each package: copy files to installDir
    - Register each file with RollbackManager before copying
    - Write registry entries
    - Create shortcuts
    - Write uninstall entry

Phase 6: Launch
  Input:  installDir
  Output: none (process spawned, Bootstrap exits)
  Steps:
    - Resolve executable path from installDir
    - Spawn as detached process (no parent handle)
    - Emit Launched event
    - os.Exit(0)
```

---

## 22. Runtime Detection

The `inspector` package probes the host machine before any installation work begins.

**OS Version:**
Uses `golang.org/x/sys/windows` to call `RtlGetVersion()`. This is preferred over `GetVersionEx()`, which lies on older Windows versions that did not have the application manifest declaring compatibility.

**Architecture:**
`runtime.GOARCH` gives the Go binary's target architecture. For detecting the host architecture (relevant when running a 32-bit binary on a 64-bit machine), we call `IsWow64Process` via syscall.

**WebView2:**
Check for the presence of the WebView2 runtime registry key at:
```
HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}
```
If WebView2 is absent, Bootstrap installs the WebView2 Evergreen Runtime silently before proceeding.

**Available Disk Space:**
Call `GetDiskFreeSpaceExW` on the target drive. Compare available bytes to `totalPackageBytes * 1.2`.

**Admin Rights:**
Check `TOKEN_ELEVATION` via `OpenProcessToken` + `GetTokenInformation`. If not elevated and registry writes are required, re-launch with `ShellExecuteEx` requesting `runas` verb to trigger UAC.

---

## 23. Environment Inspection

The `EnvironmentSnapshot` produced by inspection is logged in full at startup and attached to any error report.

```go
type Snapshot struct {
    OS              string    // "windows"
    Arch            string    // "amd64"
    OSBuildNumber   uint32    // e.g. 22621 (Win 11 22H2)
    OSVersionString string    // e.g. "Windows 11 22H2"
    IsAdmin         bool
    HasWebView2     bool
    WebView2Version string
    TotalDiskBytes  uint64
    FreeDiskBytes   uint64
    TempDir         string
    InstallDir      string
    StagingDir      string
    LogPath         string
    InspectedAt     time.Time
}
```

This snapshot is deterministic. Given the same machine state, it produces the same output. It is the only place where environment-detection logic lives.

---

## 24. Download Manager

The DownloadManager handles all network I/O for package retrieval.

**Concurrency:** Up to 4 parallel downloads. More parallelism does not meaningfully improve throughput on most consumer connections and increases the risk of hitting rate limits.

**Resumability:** Every download writes to `<stagingDir>/<packageID>.partial`. If Bootstrap is interrupted and restarted, it checks for `.partial` files and issues an HTTP Range request from the last written byte.

**Progress:** The DownloadManager emits a `DownloadProgress` struct on each 64KB chunk written.

**Error handling:**
- `HTTP 429 Too Many Requests`: Respect `Retry-After` header, wait, retry.
- `HTTP 5xx`: Exponential backoff, up to `RetryMax` attempts.
- Network error mid-stream: Retry from last byte, up to `RetryMax` attempts.
- `HTTP 404`: Fatal. The manifest pointed to a package that does not exist.

```go
type Manager interface {
    DownloadAll(ctx context.Context, packages []Package, dir string) error
}

type worker struct {
    pkg     Package
    destDir string
    client  *http.Client
    logger  Logger
    ch      chan<- DownloadProgress
}

func (w *worker) run(ctx context.Context) error {
    destPath := filepath.Join(w.destDir, w.pkg.ID+".zip")
    partPath  := destPath + ".partial"
    startByte := resumeOffset(partPath)
    req := buildRangeRequest(w.pkg.URL, startByte)
    // ... write chunks, emit progress, handle retries
}
```

---

## 25. Package Manifest Design

The package manifest is a JSON document hosted at a well-known HTTPS endpoint. It is fetched fresh on every Bootstrap run.

```json
{
  "$schema": "https://releases.airframe.app/manifest/schema/v1.json",
  "schemaVersion": "1",
  "publishedAt": "2026-07-10T00:00:00Z",
  "channel": "stable",
  "packages": [
    {
      "id": "airframe-dashboard",
      "name": "Airframe Dashboard",
      "version": "1.0.0",
      "platform": "windows",
      "arch": "amd64",
      "url": "https://github.com/airframe/releases/download/v1.0.0/airframe-dashboard-windows-amd64.zip",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb924...",
      "sizeBytes": 82212352,
      "required": true,
      "installPath": "%LOCALAPPDATA%\\Airframe\\airframe-dashboard"
    },
    {
      "id": "airframe-updater",
      "name": "Airframe Updater",
      "version": "1.0.0",
      "platform": "windows",
      "arch": "amd64",
      "url": "https://github.com/airframe/releases/download/v1.0.0/airframe-updater-windows-amd64.zip",
      "sha256": "a665a45920422f9d417e4867efdc4fb8...",
      "sizeBytes": 5242880,
      "required": true,
      "installPath": "%LOCALAPPDATA%\\Airframe\\airframe-updater"
    }
  ]
}
```

**Design decisions:**

- `schemaVersion` is a string. This allows future non-numeric versioning without breaking parsers.
- `arch` is explicit per-package. The manifest may contain entries for multiple architectures; the Resolver filters to the current environment.
- `sha256` is the hex-encoded SHA-256 of the final zip archive, not the extracted contents.
- `installPath` uses environment variable placeholders that Bootstrap expands at install time using `os.Expand`.
- `required: false` packages are user-optional (future: Airframe Hub optional components).

---

## 26. Version Resolution

The VersionResolver selects one entry per unique package `id` from the manifest for the current `platform` and `arch`.

```
Resolution rules (in priority order):
1. Filter entries where platform == inspector.Snapshot.OS
2. Filter entries where arch == inspector.Snapshot.Arch
3. Among matching entries, select the one with the highest semantic version
4. If no entry matches, return an error
```

Version comparison uses `golang.org/x/mod/semver`. All version strings in the manifest must be valid semver, enforced by the manifest-gen tool at release time.

---

## 27. Integrity Verification

Every downloaded package is verified before extraction. Verification is the only guarantee that what was downloaded matches what the Airframe team shipped. A corrupt download, a man-in-the-middle interception, or a CDN serving a stale file — all of these are detected by integrity verification.

Verification is non-optional. There is no flag to skip it. If the hash does not match, the package is deleted from disk and Bootstrap either retries the download or exits with a fatal error.

---

## 28. SHA-256 Verification

```go
func Verify(path string, expected string) error {
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
    if !strings.EqualFold(computed, expected) {
        return fmt.Errorf("verify: hash mismatch for %s: expected %s, got %s",
            filepath.Base(path), expected, computed)
    }
    return nil
}
```

The comparison uses `strings.EqualFold` to handle both upper- and lower-case hex strings. The hash is computed in a single streaming pass — the file is never read into memory in full.

---

## 29. Digital Signature Verification (Future)

SHA-256 alone verifies that the file was not corrupted in transit. It does not verify that the file was produced by Airframe.

Future versions should add Ed25519 signature verification:

1. The Airframe release pipeline signs the manifest JSON with a private Ed25519 key held in CI secrets.
2. The corresponding public key is embedded in the Bootstrap binary at build time.
3. Bootstrap verifies the manifest signature before trusting any of its contents.
4. Individual packages may also carry signatures for defense in depth.

This is not implemented in v1 because the manifest is served over HTTPS from a controlled endpoint. Ed25519 signatures provide application-layer integrity for future environments where the manifest might be mirrored or cached.

---

## 30. Package Extraction

The PackageExtractor handles `.zip` archives (primary format on Windows).

```go
func Extract(src string, dst string) error {
    r, err := zip.OpenReader(src)
    if err != nil {
        return fmt.Errorf("extract: open zip %s: %w", src, err)
    }
    defer r.Close()

    for _, f := range r.File {
        // Security: prevent zip-slip attacks
        destPath := filepath.Join(dst, filepath.Clean(f.Name))
        if !strings.HasPrefix(destPath, filepath.Clean(dst)+string(os.PathSeparator)) {
            return fmt.Errorf("extract: illegal path in archive: %s", f.Name)
        }

        if f.FileInfo().IsDir() {
            os.MkdirAll(destPath, 0755)
            continue
        }

        if err := writeFile(f, destPath); err != nil {
            return err
        }
    }
    return nil
}
```

**Zip-slip prevention** is mandatory. A maliciously crafted archive could use `../` path components to write files outside the extraction directory. The `strings.HasPrefix` check prevents this.

---

## 31. Installer Engine

The InstallerEngine moves files from `extractDir` to `installDir` package by package, staging every operation with the RollbackManager first.

```
For each package:
  1. List files in extractDir/packageID/
  2. For each file:
     a. If file exists at installDir/relative/path:
        - Move existing file to backupDir/relative/path
        - Register (backupDir/path, installDir/path) with RollbackManager
     b. Move new file from extractDir to installDir
     c. If move fails: immediately invoke Rollback
```

**Why move, not copy?**
Move operations within the same volume are atomic at the filesystem level on NTFS (`MoveFileExW` with `MOVEFILE_REPLACE_EXISTING`). A copy + delete is not atomic. A move leaves either the old file (if move fails) or the new file (if move succeeds), never a partial state.

---

## 32. Rollback Strategy

The RollbackManager tracks every file that Bootstrap moves during installation. On failure, it reverses every operation in reverse order.

```go
type Operation struct {
    OriginalPath string  // where the file was before installation
    BackupPath   string  // where we moved it for safekeeping
    NewPath      string  // where the new file was moved
}

type RollbackManager struct {
    ops    []Operation
    mu     sync.Mutex
    logger Logger
}

func (r *RollbackManager) Rollback() error {
    r.mu.Lock()
    defer r.mu.Unlock()

    // Reverse the ops slice — undo last operation first
    for i := len(r.ops) - 1; i >= 0; i-- {
        op := r.ops[i]
        os.Remove(op.NewPath)
        if op.BackupPath != "" {
            os.Rename(op.BackupPath, op.OriginalPath)
        }
    }
    return nil
}

func (r *RollbackManager) Commit() {
    r.mu.Lock()
    defer r.mu.Unlock()
    // Wipe all backups — installation is permanent
    for _, op := range r.ops {
        if op.BackupPath != "" {
            os.Remove(op.BackupPath)
        }
    }
    r.ops = nil
}
```

Rollback is **best-effort**. If a rollback operation itself fails, Bootstrap logs the failure and continues rolling back the remaining operations.

---

## 33. Atomic Installation

NTFS supports atomic file replacement via `MoveFileExW(MOVEFILE_REPLACE_EXISTING)`. Bootstrap uses this for every file move during installation.

For the installation to be logically atomic, Bootstrap follows this sequence:

1. Verify all packages before touching `installDir`.
2. Extract all packages to `stagingDir/extract/` before touching `installDir`.
3. Enter install phase: move files one by one, recording each with the RollbackManager.
4. If any move fails: immediately rollback all previous moves.
5. Only after all files are in place: write registry entries, create shortcuts.
6. Call `rollback.Commit()` to release backup files.

Registry writes and shortcut creation happen **after** all file moves succeed. This means a rollback never needs to undo a registry write that was written alongside a partial file installation.

---

## 34. Shortcut Creation

On Windows, shortcuts are `.lnk` files created using the `IShellLink` COM interface via the `go-ole` package. Shortcuts are created at:

- `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Airframe\Airframe Dashboard.lnk`
- `%PUBLIC%\Desktop\Airframe Dashboard.lnk` (optional, controlled by manifest)

Each shortcut sets:
- `SetPath`: absolute path to `airframe-dashboard.exe`
- `SetWorkingDirectory`: installation directory
- `SetIconLocation`: path to `airframe-dashboard.ico`, icon index 0
- `SetDescription`: "Airframe wireless camera receiver"

---

## 35. Registry Management

Bootstrap writes the following registry entries at installation time:

```
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Airframe Dashboard
  DisplayName         REG_SZ    "Airframe Dashboard"
  DisplayVersion      REG_SZ    "1.0.0"
  Publisher           REG_SZ    "Airframe"
  InstallLocation     REG_SZ    "C:\Users\<user>\AppData\Local\Airframe\airframe-dashboard"
  UninstallString     REG_SZ    "...\airframe-updater.exe --uninstall"
  DisplayIcon         REG_SZ    "...\airframe-dashboard.exe,0"
  EstimatedSize       REG_DWORD 81920
  NoModify            REG_DWORD 1
  NoRepair            REG_DWORD 0
  URLInfoAbout        REG_SZ    "https://airframe.app"
```

**Why HKLM and not HKCU?**
`HKLM` entries appear in "Add or Remove Programs" for all users on the machine. If Bootstrap is running without admin rights, it falls back to `HKCU` (per-user only) and presents a warning in the UI.

**Uninstall delegation:**
The `UninstallString` points to `airframe-updater.exe --uninstall`, not to Bootstrap. Bootstrap is a one-shot tool; uninstallation is an ongoing responsibility owned by the Updater.

---

## 36. File Associations

Airframe project files use the `.airframe` extension. Bootstrap registers this association:

```
HKCU\SOFTWARE\Classes\.airframe
  (default)  =  "AirframeProject"

HKCU\SOFTWARE\Classes\AirframeProject
  (default)           = "Airframe Project"
  FriendlyTypeName    = "Airframe Project"
  shell\open\command  = "\"...\airframe-dashboard.exe\" \"%1\""
  DefaultIcon         = "...\airframe-dashboard.exe,1"
```

`SHChangeNotify(SHCNE_ASSOCCHANGED, ...)` is called after writing to notify the shell to refresh its association cache.

---

## 37. Uninstall Registration

The Airframe Updater is responsible for uninstallation. Its `--uninstall` mode must:
1. Terminate any running Airframe processes.
2. Remove all files in the installation directory.
3. Delete registry entries written by Bootstrap.
4. Remove shortcuts.
5. Remove file associations.
6. Remove the Updater itself last.

Bootstrap's only uninstall responsibility is to write the correct `UninstallString` during installation.

---

## 38. Logging

All logging uses a structured logger with the following contract:

```go
type Logger interface {
    Debug(msg string, fields ...Field)
    Info(msg string, fields ...Field)
    Warn(msg string, fields ...Field)
    Error(msg string, fields ...Field)
    Fatal(msg string, fields ...Field)  // logs then os.Exit(1)
}
```

Log output format (JSON):
```json
{"ts":"2026-07-10T00:12:34Z","level":"info","component":"download","msg":"download started","package":"airframe-dashboard","size_bytes":82212352}
{"ts":"2026-07-10T00:12:38Z","level":"info","component":"download","msg":"download complete","package":"airframe-dashboard","bytes":82212352,"duration_ms":4021}
{"ts":"2026-07-10T00:12:38Z","level":"info","component":"verify","msg":"hash verified","package":"airframe-dashboard","sha256":"e3b0c4..."}
```

Log files are written to `%LOCALAPPDATA%\Airframe\bootstrap\logs\bootstrap-<date>.log`. Logs are rotated at 10 MB. Logs older than 30 days are deleted on startup.

---

## 39. Error Handling

Errors in Go are values. Bootstrap never panics in production code. Every function that can fail returns an `error`.

**Error classification:**

| Class | Definition | Bootstrap response |
|---|---|---|
| `ErrFatal` | Machine is unsuitable; cannot proceed | Present error to user, emit log, exit |
| `ErrRecoverable` | Operation failed but can be retried | Show retry button in UI |
| `ErrIntegrity` | Hash mismatch | Delete package, retry download |
| `ErrNetwork` | Transient HTTP/TCP error | Exponential backoff and retry |
| `ErrPermission` | Access denied | Re-launch elevated or show guidance |

Every error presented to the user includes:
1. A plain-English description of what went wrong.
2. What Bootstrap is going to do about it.
3. A link to the log file for technical details.
4. A support code (the error's structured `code` field) for bug reports.

---

## 40. Recovery Strategy

**Interrupted download:** On restart, the `.partial` file is detected and the download resumes.

**Interrupted verification:** Always re-run from scratch (fast, CPU-bound).

**Interrupted extraction:** The extraction directory is wiped and re-extracted from the cached `.zip`.

**Interrupted installation:** Bootstrap detects a partial installation by checking for a marker file (`%LOCALAPPDATA%\Airframe\.install-lock`). If the lock file exists on startup and no running Airframe process is found, Bootstrap assumes an interrupted installation and begins from the extraction phase.

**Interrupted registry/shortcut phase:** Bootstrap writes `HKCU\SOFTWARE\Airframe\Bootstrap\State = "registering"` before this phase and updates it to `"complete"` after. On restart, if this key shows `"registering"`, Bootstrap re-runs the registry and shortcut phase.

---

## 41. Security Model

**Code signing.** The Bootstrap binary must be signed with an EV Code Signing Certificate before distribution. An unsigned executable triggers Windows SmartScreen, severely damaging user trust.

**HTTPS only.** The manifest URL and all package download URLs must use HTTPS. Bootstrap refuses HTTP URLs.

**No unauthenticated code execution.** Every downloaded package is SHA-256 verified before extraction. The only executable launched by Bootstrap is the one installed to the known `installDir`.

**Principle of least privilege.** Bootstrap requests admin rights only if required for HKLM registry writes or installation to a protected directory.

**No telemetry in v1.** Bootstrap collects no usage data. The log file stays on the user's machine.

**Process isolation.** Airframe is launched as a fully independent process. Bootstrap does not inject any DLLs, does not share memory with Airframe, and does not maintain any IPC channel post-launch.

---

## 42. Threading Model

Bootstrap uses two threads of execution at the application level:

1. **Main goroutine**: Wails application event loop (UI, IPC, window management).
2. **Orchestrator goroutine**: The installation pipeline, launched with `go orchestrator.Run(ctx)`.

Within the Orchestrator goroutine, additional goroutines are spawned by the DownloadManager for parallel downloads (one goroutine per package, bounded to 4 concurrent).

```
UI goroutine (Wails main loop)
  ^
  | (EventsOn subscription) -- React renders progress
  |
  | (wails.EventsEmit -- thread-safe)
  |
Orchestrator goroutine
  ^
  | (reads from channels)
  |
Download worker goroutines (x4)
```

---

## 43. Concurrency

Beyond the download phase, Bootstrap is largely sequential. Each installation phase completes before the next begins. This is intentional: it makes error handling, logging, and rollback dramatically simpler.

**Context propagation.** A single `context.Context` is created at `app.startup()` and passed to every subsystem. When the user presses Cancel, the context is cancelled. Every goroutine checks `ctx.Done()` at checkpoints and returns early if cancelled.

---

## 44. Progress Reporting

**Events emitted by Go:**

```go
// Phase lifecycle
"bootstrap:phase"    -> PhaseEvent{Phase, Status, Message}

// Per-package download progress (max 1 event per 100ms per package)
"bootstrap:progress" -> ProgressEvent{PackageID, BytesDone, BytesTotal, SpeedBps}

// Error
"bootstrap:error"    -> ErrorEvent{Phase, Code, Message, Recoverable, LogPath}

// Installation complete
"bootstrap:done"     -> DoneEvent{LaunchedAt}
```

**Events received by React (`useBootstrapState`):**

```typescript
useEffect(() => {
    const off1 = EventsOn("bootstrap:phase", (e: PhaseEvent) => {
        dispatch({ type: "PHASE_UPDATE", payload: e });
    });
    const off2 = EventsOn("bootstrap:progress", (e: ProgressEvent) => {
        dispatch({ type: "PROGRESS_UPDATE", payload: e });
    });
    const off3 = EventsOn("bootstrap:error", (e: ErrorEvent) => {
        dispatch({ type: "ERROR", payload: e });
    });
    const off4 = EventsOn("bootstrap:done", () => {
        dispatch({ type: "DONE" });
    });
    return () => { off1(); off2(); off3(); off4(); };
}, []);
```

---

## 45. Communication Between Components

All communication between Go and React flows through Wails's IPC system.

**Go -> React (events):** `wails.EventsEmit` pushes events to all subscribed React handlers. These are fire-and-forget.

**React -> Go (function calls):** Wails bindings expose Go methods as async TypeScript functions. Bootstrap exposes a minimal surface:

```typescript
export function GetInstallPath(): Promise<string>;
export function Cancel(): Promise<void>;
export function Retry(): Promise<void>;
export function GetLogPath(): Promise<string>;
export function OpenLogFile(): Promise<void>;
```

Bootstrap does **not** expose any function that directly controls the installation pipeline. The pipeline is driven by Go. The frontend only requests cancellation or retry.

---

## 46. Launching Airframe

After successful installation, Bootstrap launches `airframe-dashboard.exe` as a detached process using `CreateProcess` with `CREATE_NEW_PROCESS_GROUP`:

```go
func (l *launcher) Launch(execPath string) error {
    cmd := exec.Command(execPath)
    cmd.SysProcAttr = &syscall.SysProcAttr{
        CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP,
        HideWindow:    false,
    }
    if err := cmd.Start(); err != nil {
        return fmt.Errorf("launcher: start %s: %w", execPath, err)
    }
    // Do NOT call cmd.Wait(). Let the child run independently.
    return nil
}
```

Bootstrap then emits the `bootstrap:done` event, which causes the React UI to show a brief "Launching Airframe..." message before the Wails window closes.

---

## 47. Why Bootstrap Exits

Bootstrap exits because its responsibility is over.

An installer that keeps running after installation is a persistent process consuming resources, appearing in the task manager, and potentially interfering with the application it installed.

More importantly, Airframe has its own Updater. If Bootstrap remained running and the Updater attempted an update, there would be two processes competing to modify the same files.

The moment Airframe is confirmed to be running, Bootstrap has no further purpose. It exits with code 0.

---

## 48. Relationship with Airframe Updater

The Airframe Updater is one of the packages Bootstrap installs. Its purpose:
- Check for Airframe updates on a schedule or on user request
- Download and verify updated packages
- Install updates atomically
- Handle rollback if an update breaks Airframe
- Manage uninstallation

The relationship is one-directional: Bootstrap installs the Updater. The Updater owns everything after that. Bootstrap has no communication with the Updater at runtime.

---

## 49. Update Architecture

**Bootstrap's role in updates: none.**

Bootstrap is not re-run to update Airframe. The Updater handles all updates.

**The Updater uses the same manifest format** as Bootstrap (same JSON schema, same SHA-256 verification, same download manager logic). The manifest format is stable and shared infrastructure.

---

## 50. Release Pipeline

A Bootstrap release consists of:

1. A signed `Airframe Bootstrap.exe` binary (produced by `wails build` + `sign.ps1`)
2. A manifest JSON file uploaded to the release endpoint
3. A GitHub Release entry with attached binary
4. A SHA-256 checksum file (`checksums.txt`) for the Bootstrap binary itself

The release pipeline is triggered by pushing a semver tag to the `main` branch.

---

## 51. GitHub Releases Strategy

Bootstrap's own binary is distributed via GitHub Releases. Package manifests are served from a dedicated endpoint (`https://releases.airframe.app/manifest/stable.json`).

**Why GitHub Releases?**
- CDN-backed, globally distributed
- Supports HTTP Range requests (resumable downloads)
- Free for open-source projects
- Deterministic URLs based on tag and filename
- Native integration with GitHub Actions for automated publishing

The manifest URL is embedded in the Bootstrap binary at build time:
```go
const ManifestURL = "https://releases.airframe.app/manifest/stable.json"
```

This can be overridden at build time via `ldflags` for staging/test environments:
```bash
go build -ldflags="-X main.ManifestURL=https://staging.releases.airframe.app/manifest/stable.json"
```

---

## 52. CI/CD

```yaml
# .github/workflows/release.yml
on:
  push:
    tags:
      - 'v*'

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - name: Install Wails
        run: go install github.com/wailsapp/wails/v2/cmd/wails@latest
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Build
        run: wails build -platform windows/amd64 -o "Airframe Bootstrap.exe"
      - name: Sign
        run: .\scripts\sign.ps1 "Airframe Bootstrap.exe"
        env:
          SIGN_CERT_BASE64: ${{ secrets.SIGN_CERT_BASE64 }}
          SIGN_CERT_PASSWORD: ${{ secrets.SIGN_CERT_PASSWORD }}
      - name: Compute Checksum
        run: |
          $hash = (Get-FileHash "Airframe Bootstrap.exe" -Algorithm SHA256).Hash.ToLower()
          "$hash  Airframe Bootstrap.exe" | Out-File checksums.txt
      - name: Generate Manifest
        run: go run ./tools/manifest-gen -version ${{ github.ref_name }} -output stable.json
      - name: Upload to GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            Airframe Bootstrap.exe
            checksums.txt
      - name: Deploy Manifest
        run: .\scripts\release.ps1 stable.json
        env:
          MANIFEST_DEPLOY_KEY: ${{ secrets.MANIFEST_DEPLOY_KEY }}
```

---

## 53. Testing Strategy

**Unit tests (internal packages):**
Every `internal/` package has a `_test.go` file. Tests use interface mocks; no real network calls, no real filesystem operations. Tests run in < 1 second each.

```go
func TestVerifier_Match(t *testing.T) {
    dir := t.TempDir()
    content := []byte("airframe")
    expected := sha256hex(content)
    path := filepath.Join(dir, "test.zip")
    os.WriteFile(path, content, 0644)

    v := verify.New(noopLogger{})
    if err := v.Verify(path, expected); err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
}

func TestVerifier_Mismatch(t *testing.T) {
    // ...
    if err := v.Verify(path, "deadbeef"); err == nil {
        t.Fatal("expected error on hash mismatch")
    }
}
```

**Integration tests (`tests/integration/`):**
Integration tests spin up a local HTTP server serving mock packages with known SHA-256 hashes. They test the full download -> verify -> extract -> install pipeline against the real filesystem.

**End-to-end tests (`tests/e2e/`):**
E2E tests build the Wails binary and launch it in headless mode with a test manifest URL via `ldflags`. They assert that after the process exits, the expected files are present and registry entries exist.

**Fuzz testing:**
The manifest parser and zip extractor are fuzz-tested with `go test -fuzz=.` to detect panics on malformed inputs.

**Target coverage:** > 80% unit test coverage for `internal/` packages.

---

## 54. Design System

Bootstrap inherits the Airframe design system.

**Color tokens:**

| Token | Value | Usage |
|---|---|---|
| `--color-background` | `#F5F5F3` | App background |
| `--color-foreground` | `#0F0F0E` | Primary text, filled buttons |
| `--color-card` | `#FFFFFF` | Card surfaces |
| `--color-muted` | `#ECEAE6` | Secondary surfaces |
| `--color-muted-foreground` | `#6B6B69` | Secondary text, labels |
| `--color-accent` | `#0054FA` | Airframe blue; progress fill |
| `--color-border` | `rgba(0,0,0,0.08)` | Borders |
| `--color-success` | `#10B981` | Completed steps |
| `--color-error` | `#EF4444` | Errors, failed states |

**Typography:**

| Role | Family | Weight | Usage |
|---|---|---|---|
| UI labels | Figtree | 400/500/600 | All human-readable text |
| Values, paths, codes | DM Mono | 400/500 | Bytes, progress values, file paths |

**Spacing:** 4px base unit. All spacing values are multiples of 4.

**Border radius:** `0.875rem` (14px) for cards; `0.5rem` (8px) for buttons and inputs; `9999px` for pills.

**Shadows:** One elevation level: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)`.

---

## 55. UI Architecture

Bootstrap's UI has three views:

**WelcomeView** (pre-install):
- Airframe logo + wordmark
- "Airframe Dashboard" headline
- Package list with sizes
- "Install" button (primary action)
- Installation path display

**InstallView** (active):
- Ordered step list: v complete, * active (pulsing), o pending, x error
- Per-phase status message
- Global progress bar (aggregate)
- Per-package progress rows (during download phase)
- Estimated time remaining
- Cancel button (only active before files start being moved)

**ErrorView / DoneView:**
- On error: error icon, plain-English description, retry button, log file link
- On success: checkmark animation, "Airframe is ready" message, auto-launch

---

## 56. Animation Principles

Airframe's design language is minimal. Animations must serve a purpose.

1. **Progress is always motion.** The progress bar fill is always animated: `transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1)`.
2. **State transitions are brief.** A step changing from active to complete uses a 200ms cross-fade.
3. **Indeterminate spinners are always visible during waiting states.**
4. **No bounce, no spring, no overshoot.** Ease-in-out curves exclusively.
5. **The completion animation is the only expressive moment.** A checkmark drawing itself in 400ms, followed by a subtle scale-up of the "Airframe is ready" text.

---

## 57. Accessibility

**Keyboard navigation.** Every interactive element is keyboard-focusable and operable with Enter/Space.

**Screen readers.** Phase transitions emit `aria-live="polite"` announcements. The step list is a `<ol>` with `aria-label`. Progress bars use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

**Color independence.** Step status is communicated by both color and icon. A screen in grayscale is still fully readable.

**Contrast ratios.** All text meets WCAG AA minimum contrast ratios (4.5:1 for body text, 3:1 for large text).

**Focus management.** When Bootstrap transitions to the error state, focus is moved to the error heading so screen reader users are immediately aware of the state change.

---

## 58. Future Evolution

Bootstrap v1 is deliberately narrow in scope. Its architecture enables expansion into the Airframe Hub without requiring a rewrite.

The three key architectural decisions that enable this:

**1. The package manifest is the contract.**
The manifest defines what gets installed. The Orchestrator does not hardcode which packages to install. Adding new installable components requires only updating the manifest format and the VersionResolver.

**2. Every subsystem is an interface.**
Swapping the `InstallerEngine` for a plugin-aware installer, or adding a `LicenseChecker` between verification and installation, requires only a new implementation of the existing interface. No existing code needs to change.

**3. The UI is a view, not a driver.**
The React frontend renders state. Adding new views for "Component Management" or "Available Updates" requires only new React views and new Go event types. The existing Orchestrator does not change.

---

## 59. Airframe Hub

The Airframe Hub is the future state of Bootstrap: a persistent application that manages the entire Airframe ecosystem on a user's machine.

**Capabilities of the Hub (target state):**

- Install, update, and uninstall Airframe products
- Discover and install plugins from a curated registry
- Download optional components (SDKs, capture modules, receivers)
- Show installed versions vs. available versions
- One-click repair of corrupt installations
- Component-level update granularity
- Diagnostics: run health checks on installed components
- Enterprise deployment support: group policy, silent install manifests

**Architectural continuity:**
Bootstrap's package manifest format is the Hub's package registry format. Bootstrap's download/verify/install pipeline is the Hub's install pipeline. The Hub adds: a persistent process, a package registry API client, a persistent state store (SQLite), a plugin manifest format, and a management UI.

None of this requires breaking changes to Bootstrap's internal packages.

---

## 60. Plugin Installation

Plugins follow the same manifest format as core packages:

```json
{
  "id": "obs-webrtc-plugin",
  "name": "OBS WebRTC Plugin",
  "version": "1.2.0",
  "platform": "windows",
  "arch": "amd64",
  "url": "...",
  "sha256": "...",
  "sizeBytes": 4194304,
  "required": false,
  "installPath": "%APPDATA%\\obs-studio\\plugins\\obs-webrtc",
  "postInstall": {
    "type": "restart-required",
    "message": "OBS must be restarted for the plugin to take effect."
  }
}
```

The `postInstall` field is not implemented in Bootstrap v1. It is reserved for the Hub.

---

## 61. Component Installer

The Component Installer is the Hub-era equivalent of Bootstrap's InstallerEngine. It adds:

- Dependency resolution between components
- Optional/required distinction
- Version pinning
- Side-by-side versions
- Component repair (re-download and reinstall individual components)

Bootstrap's InstallerEngine is a subset of the Component Installer. The upgrade path is: Hub imports `internal/install`, extends it with a `ComponentRegistry`, and adds the above features on top.

---

## 62. Package Manager Vision

The long-term vision is for the Airframe Hub to function as a domain-specific package manager for the Airframe ecosystem — similar in spirit to `winget` or `brew`, but:

- Scoped exclusively to Airframe components
- Integrated with Airframe's authentication system
- Supporting licensed components (premium plugins, enterprise SDKs)
- Providing rollback at the package level

Bootstrap's core abstractions — manifest, package, resolver, downloader, verifier, extractor, installer — are all present in v1. Bootstrap is the first iteration of this package manager, constrained to a single use case.

---

## 63. Risks

| Risk | Severity | Probability | Mitigation |
|---|---|---|---|
| WebView2 not installed | High | Medium | Bootstrap installs WebView2 Evergreen Runtime silently |
| SHA-256 mismatch due to CDN corruption | High | Low | Retry download; second mismatch = fatal error |
| Network timeout during manifest fetch | Medium | Low | Retry with backoff; after 3 failures, show error |
| Disk full during installation | High | Low | Check available space in pre-flight |
| UAC denied by user | Medium | Medium | Fallback to per-user install (HKCU only) |
| Antivirus blocking Wails output | Medium | Medium | Code signing reduces false positives |
| Windows Defender SmartScreen block | High | Medium | EV code signing certificate builds reputation |
| Corrupted `.partial` file on resume | Low | Low | Verify partial file size matches Content-Range |
| GitHub Releases CDN unavailable | High | Very Low | Future: mirror manifest to secondary endpoint |

---

## 64. Tradeoffs

**Wails vs. Electron:**
Wails produces a ~10MB binary vs. Electron's ~150MB. The tradeoff: WebView2 must be present (Bootstrap installs it if missing). Electron bundles Chromium and has no prerequisite. Wails is correct for Airframe because WebView2 is already in use for the Dashboard.

**Parallel downloads vs. sequential:**
Parallel downloads complete faster but make error handling more complex. The 4-worker cap balances throughput against complexity.

**In-memory RollbackManager vs. persistent rollback journal:**
An in-memory rollback manager is simple and fast but is lost if the process crashes. A persistent journal would survive crashes. For v1, this tradeoff is acceptable.

**No telemetry in v1:**
Without crash reports, diagnosing systemic issues requires users to file bug reports with log files. v2 will introduce opt-in anonymous telemetry.

---

## 65. Technical Decisions

**Why Go for the backend?**
Go is already the language of Airframe's backend components. Using it for Bootstrap ensures consistent tooling, shared knowledge between contributors, and the ability to share `pkg/` utilities across components.

**Why Tailwind CSS v4?**
The Dashboard already uses Tailwind CSS v4 with `@tailwindcss/vite`. Bootstrap uses the same configuration for visual consistency.

**Why `golang.org/x/sys/windows/registry` instead of shelling out to `reg.exe`?**
The `registry` package is a direct Win32 API call via syscall bindings. It is faster, more reliable, and testable vs. shell execution.

**Why `embed.FS` for frontend assets?**
Wails embeds the compiled frontend bundle into the Go binary using `//go:embed all:frontend/dist`. This produces a single self-contained executable.

**Why semver for all package versions?**
Semver provides a well-defined comparison algorithm and widely understood semantics.

**Why not use an existing installer framework (NSIS, Inno Setup, WiX)?**
Traditional installer frameworks look like traditional Windows installers. Airframe's identity is modern and different. A Wails application looks and behaves exactly like an Airframe product — because it is one.

---

## 66. Engineering Invariants

The Engineering Invariants are the architectural constitution of Bootstrap. Breaking an invariant is a breaking change requiring documented justification.

### I-01: Bootstrap Never Contains Airframe Binaries

The Bootstrap binary must not embed, bundle, or pre-include any Airframe application binaries.

*Rationale:* Embedding binaries couples Bootstrap's release to Airframe's release and prevents downloading only the packages relevant to the user's platform.

### I-02: Bootstrap Never Performs Application Updates

Bootstrap installs Airframe once. All subsequent updates are the responsibility of the Airframe Updater.

*Rationale:* A single process responsible for both installation and updates is a design conflation.

### I-03: Bootstrap Never Communicates with Airframe After Launch

After `launcher.Launch()` is called, Bootstrap emits the `done` event and exits. No IPC channel, socket, file, or shared memory segment exists between Bootstrap and the running Airframe process.

*Rationale:* Any persistent communication channel is a responsibility boundary violation.

### I-04: Every Downloaded Package Must Be Verified

The integrity verification phase cannot be skipped, bypassed, or made optional via flags.

*Rationale:* The hash is the only thing that stands between Bootstrap and installing a corrupted or tampered package. Invariants are not partially enforced.

### I-05: Every Subsystem Has Exactly One Responsibility

A subsystem (Go package or React component) that has two distinct responsibilities must be split into two subsystems.

*Rationale:* Single responsibility makes units independently testable, independently replaceable, and comprehensible in isolation.

### I-06: Installation Must Be Recoverable

An interrupted installation must leave the machine in a state that allows Bootstrap to be re-run and complete installation.

*Rationale:* The user's machine is more important than any individual installation.

### I-07: Installation Must Be Resumable at the Download Level

If Bootstrap is restarted after a partial download, it must resume from where it left off.

*Rationale:* On a slow connection or with large packages, forcing a restart from zero after an interruption is unacceptable UX.

### I-08: The UI Must Remain Responsive at All Times

The React frontend must never block the main thread. All Go operations run in goroutines.

*Rationale:* A frozen UI during a download is indistinguishable from a crashed application.

### I-09: Business Logic Must Not Exist Inside UI Components

React components are presentation components. All logic lives in hooks or in Go.

*Rationale:* Business logic in UI components is difficult to test, difficult to reuse, and blurs the boundary between presentation and logic.

### I-10: Bootstrap Must Be Platform-Agnostic at the Core, Platform-Specific at the Edge

The `orchestrator`, `manifest`, `download`, `verify`, and `extract` packages must compile correctly on any platform. Platform-specific code is isolated in `registry`, `shortcut`, `pkg/platform`, and platform-specific build tags.

*Rationale:* Airframe may expand to macOS. Keeping the core agnostic means the macOS installer requires only new implementations of `registry.Manager` and `shortcut.Creator`.

### I-11: Every Subsystem Must Expose Clear Interfaces

No subsystem is consumed by importing its concrete types. Every consumer depends on an interface.

*Rationale:* Interfaces at boundaries make mocking trivial, enable parallel development, and make the dependency graph explicit.

### I-12: Every Subsystem Must Be Independently Testable

Every `internal/` package must have a `_test.go` file. Unit tests must not require a network connection or real filesystem unless marked as integration tests.

*Rationale:* Untested code is unverified code.

### I-13: Errors Are Never Silently Swallowed

Every error returned by a function is either handled or propagated to the caller. Errors are never discarded with `_`.

*Rationale:* Silent error handling is the primary source of "it just stopped working" bugs.

### I-14: All Temporary Files Are Cleaned Up on Success

On successful installation, Bootstrap removes the `staging/` and `extract/` directories. It retains only the log file.

*Rationale:* Temporary files consume disk space and may be flagged by antivirus software.

### I-15: No Hardcoded Package Information

Bootstrap never hardcodes the name, URL, version, or hash of any Airframe package. All such information comes from the manifest.

*Rationale:* Hardcoded package information makes it impossible to ship Bootstrap independently of Airframe releases.

---

## 67. Roadmap

### v1.0 — Foundation (current scope)
- Environment detection (OS, arch, WebView2, disk space, admin rights)
- Manifest download + version resolution
- Parallel resumable downloads
- SHA-256 verification
- Zip extraction
- Atomic file installation
- Windows registry (uninstall, file associations)
- Start Menu shortcuts
- Launch Airframe + exit
- Structured logging
- Error + rollback handling

### v1.1 — Polish
- Estimated time remaining in UI
- Support link with pre-filled log attachment
- Per-user install fallback (no UAC for limited-rights environments)
- Log file viewer in UI
- Multi-language error messages

### v1.2 — Enterprise
- Silent install mode (`--silent --install-path=... --no-shortcuts`)
- Group policy override for install path and manifest URL
- Verbose console output in silent mode
- Documented exit codes for all failure scenarios
- MSI wrapper for enterprise deployment tooling

### v2.0 — Airframe Hub Foundation
- Persistent Hub process (replaces one-shot Bootstrap)
- Installed components list
- Version management (installed vs. available)
- Per-component update
- Plugin registry

### v2.1 — Plugin Ecosystem
- Plugin marketplace integration
- Plugin sandboxing model
- Plugin dependency resolution

### v3.0 — Airframe Hub Full
- Cross-platform (macOS)
- Component repair
- Opt-in telemetry
- Licensing integration
- Enterprise management API

---

## 68. Appendix

### A. Exit Codes

| Code | Meaning |
|---|---|
| `0` | Installation succeeded, Airframe launched |
| `1` | Unknown fatal error |
| `2` | Environment inspection failed |
| `3` | Manifest fetch failed after all retries |
| `4` | Package download failed after all retries |
| `5` | Package verification failed (hash mismatch) |
| `6` | Package extraction failed |
| `7` | Installation failed (file copy error, permission denied) |
| `8` | Registry write failed |
| `9` | Launch failed |
| `10` | Cancelled by user |
| `11` | WebView2 installation failed |

### B. Registry Keys Written (Complete List)

```
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Airframe Dashboard
  DisplayName, DisplayVersion, Publisher, InstallLocation,
  UninstallString, DisplayIcon, EstimatedSize, NoModify, NoRepair,
  URLInfoAbout

HKCU\SOFTWARE\Airframe
  Version, InstallPath, InstalledAt

HKCU\SOFTWARE\Airframe\Bootstrap\State
  State ("complete" | "registering")

HKCU\SOFTWARE\Classes\.airframe
  (default) = "AirframeProject"

HKCU\SOFTWARE\Classes\AirframeProject
  (default), FriendlyTypeName, shell\open\command, DefaultIcon
```

### C. Lock File Protocol

Bootstrap writes `%LOCALAPPDATA%\Airframe\.install-lock` at the start of Phase 5. The file contains:

```json
{"startedAt":"2026-07-10T00:12:00Z","phase":"install","pid":1234}
```

On startup, Bootstrap checks for this file. If present and the PID is not a running process, it assumes an interrupted installation and begins from Phase 4.

The lock file is deleted after `rollback.Commit()` in Phase 5.

---

## 69. Glossary

| Term | Definition |
|---|---|
| **Bootstrap** | This application. The one-time installer that prepares a machine for Airframe. |
| **Airframe** | The primary Airframe application (airframe-dashboard.exe) that Bootstrap installs. |
| **Airframe Hub** | The future evolution of Bootstrap into a persistent component management application. |
| **Airframe Updater** | A component installed by Bootstrap that manages Airframe updates and uninstallation. |
| **Manifest** | A JSON document describing the packages available for installation. |
| **Package** | A versioned, platform-specific archive (zip) containing files to be installed. |
| **SHA-256** | Secure Hash Algorithm 256-bit. Used to verify downloaded package integrity. |
| **Wails** | A Go framework for building desktop applications with a web frontend in a WebView2 shell. |
| **WebView2** | Microsoft's Chromium-based web rendering component used by Wails on Windows. |
| **Orchestrator** | The Go component that drives the installation pipeline from start to finish. |
| **Staging directory** | A temporary directory where packages are downloaded before installation. |
| **Extract directory** | A temporary directory where packages are extracted before file-level installation. |
| **Install directory** | The final destination where Airframe files reside. |
| **Atomic installation** | An installation approach where either all files are moved into place or none are. |
| **Rollback** | The process of reverting file-level changes made during a failed installation. |
| **RollbackManager** | The Go component that records pre-installation state and can undo changes on failure. |
| **Phase** | One of the seven stages of the Bootstrap lifecycle. |
| **Engineering Invariant** | An architectural rule that must not be broken without a documented architectural review. |
| **EV Certificate** | Extended Validation code signing certificate; required for Windows SmartScreen reputation. |
| **Zip-slip** | A vulnerability in zip extraction where archive entries with `../` path components write files outside the extraction directory. |
| **Semver** | Semantic Versioning (major.minor.patch). The version format used in all Airframe manifests. |
| **ldflags** | Go linker flags used at build time to inject values into the binary. |
| **HKLM** | HKEY_LOCAL_MACHINE. Windows registry hive for machine-wide settings. Requires admin rights to write. |
| **HKCU** | HKEY_CURRENT_USER. Windows registry hive for per-user settings. Does not require admin rights. |
| **mDNS** | Multicast DNS. Used by the Airframe Dashboard for local network device discovery. |
| **WebRTC** | Web Real-Time Communication. The protocol used for video streaming between Capture App and Dashboard. |
| **IPC** | Inter-Process Communication. Bootstrap uses Wails's WebView2 bridge as its IPC channel. |
| **Context propagation** | Passing Go's context.Context through the call chain to carry cancellation signals. |

---

*End of Airframe Bootstrap Engineering Blueprint v1.0.0*

*This document is a living specification. Sections should be updated when architectural decisions change. Changes to Engineering Invariants require documented justification and sign-off from the system owner.*
