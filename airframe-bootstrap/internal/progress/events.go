package progress

// PhaseID identifies one of Bootstrap's installation phases.
type PhaseID string

const (
	PhasePreFlight   PhaseID = "preflight"
	PhaseManifest    PhaseID = "manifest"
	PhaseDownload    PhaseID = "download"
	PhaseVerify      PhaseID = "verify"
	PhaseExtract     PhaseID = "extract"
	PhaseInstall     PhaseID = "install"
	PhaseLaunch      PhaseID = "launch"
)

// PhaseStatus is the lifecycle state of a phase.
type PhaseStatus string

const (
	StatusPending  PhaseStatus = "pending"
	StatusActive   PhaseStatus = "active"
	StatusComplete PhaseStatus = "complete"
	StatusError    PhaseStatus = "error"
)

// PhaseEvent is emitted when a phase changes state.
type PhaseEvent struct {
	Phase   PhaseID     `json:"phase"`
	Status  PhaseStatus `json:"status"`
	Message string      `json:"message,omitempty"`
}

// PackageInfo is a package descriptor sent to the frontend before downloading.
type PackageInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Version   string `json:"version"`
	SizeBytes int64  `json:"sizeBytes"`
}

// ManifestLoadedEvent is emitted after the manifest is resolved.
type ManifestLoadedEvent struct {
	Packages   []PackageInfo `json:"packages"`
	TotalBytes int64         `json:"totalBytes"`
}

// ProgressEvent is emitted for each download chunk.
type ProgressEvent struct {
	PackageID  string `json:"packageId"`
	BytesDone  int64  `json:"bytesDone"`
	BytesTotal int64  `json:"bytesTotal"`
	SpeedBps   int64  `json:"speedBps"`
}

// ErrorEvent is emitted when an unrecoverable or recoverable error occurs.
type ErrorEvent struct {
	Phase       PhaseID `json:"phase"`
	Code        string  `json:"code"`
	Message     string  `json:"message"`
	Recoverable bool    `json:"recoverable"`
	LogPath     string  `json:"logPath"`
}

// DoneEvent is emitted when Bootstrap has successfully launched Airframe.
type DoneEvent struct {
	LaunchedAt string `json:"launchedAt"` // RFC3339
}

// Wails event names — must match the TypeScript EventsOn keys exactly.
const (
	EventPhase     = "bootstrap:phase"
	EventProgress  = "bootstrap:progress"
	EventManifest  = "bootstrap:manifest"
	EventError     = "bootstrap:error"
	EventDone      = "bootstrap:done"
)
