import type { ErrorEvent } from '../types/events';
import { OpenLogFile, Cancel } from '../../wailsjs/go/main/App';

interface ErrorDisplayProps {
  error: ErrorEvent;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  function handleOpenLog() {
    OpenLogFile().catch(console.error);
  }

  function handleCancel() {
    Cancel().catch(console.error);
    window.close?.();
  }

  return (
    <div className="error-display fade-in" role="alert">
      <div className="error-display__header">
        <span className="error-display__icon">
          <AlertIcon />
        </span>
        <div>
          <div className="error-display__title">Installation failed</div>
          <div className="error-display__msg">{friendlyMessage(error)}</div>
        </div>
      </div>

      {error.code && (
        <div className="error-display__code">Error code: {error.code}</div>
      )}

      <div className="error-display__actions">
        {error.recoverable && onRetry && (
          <button className="btn btn--primary" onClick={onRetry} id="btn-retry">
            Try Again
          </button>
        )}
        {error.logPath && (
          <button className="btn btn--ghost" onClick={handleOpenLog} id="btn-view-log">
            View Log
          </button>
        )}
        <button className="btn btn--danger" onClick={handleCancel} id="btn-cancel-error">
          Close
        </button>
      </div>
    </div>
  );
}

function friendlyMessage(error: ErrorEvent): string {
  switch (error.code) {
    case 'MANIFEST_FETCH_FAILED':
      return 'Could not download the package list. Check your internet connection and try again.';
    case 'DOWNLOAD_FAILED':
      return 'One or more packages failed to download. Check your connection and try again.';
    case 'INTEGRITY_FAILED':
      return 'A downloaded package failed integrity verification. The file may be corrupted. Try again.';
    case 'INSUFFICIENT_DISK':
      return 'Not enough disk space to install Airframe. Free up space and try again.';
    case 'INSTALL_FAILED':
      return 'Airframe could not be installed. Check you have permission to write to the install directory.';
    case 'LAUNCH_FAILED':
      return 'Airframe was installed but could not be launched. Try opening it from the Start Menu.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5.5v4M9 12h.01" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
    </svg>
  );
}
