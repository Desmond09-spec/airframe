// Typed mirror of Go progress event structs.
// Must stay in sync with internal/progress/events.go.

export type PhaseID =
  | 'preflight'
  | 'manifest'
  | 'download'
  | 'verify'
  | 'extract'
  | 'install'
  | 'launch';

export type PhaseStatus = 'pending' | 'active' | 'complete' | 'error';

export interface PhaseEvent {
  phase: PhaseID;
  status: PhaseStatus;
  message?: string;
}

export interface PackageInfo {
  id: string;
  name: string;
  version: string;
  sizeBytes: number;
}

export interface ManifestLoadedEvent {
  packages: PackageInfo[];
  totalBytes: number;
}

export interface ProgressEvent {
  packageId: string;
  bytesDone: number;
  bytesTotal: number;
  speedBps: number;
}

export interface ErrorEvent {
  phase: PhaseID;
  code: string;
  message: string;
  recoverable: boolean;
  logPath: string;
}

export interface DoneEvent {
  launchedAt: string; // RFC3339
}

// Wails event name constants.
export const EVENT_PHASE    = 'bootstrap:phase';
export const EVENT_PROGRESS = 'bootstrap:progress';
export const EVENT_MANIFEST = 'bootstrap:manifest';
export const EVENT_ERROR    = 'bootstrap:error';
export const EVENT_DONE     = 'bootstrap:done';
