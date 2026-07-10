import type { ErrorEvent } from '../types/events';
import { ErrorDisplay } from '../components/ErrorDisplay';

interface DoneViewProps {
  error: ErrorEvent | null;
  doneAt: string | null;
}

export function DoneView({ error, doneAt }: DoneViewProps) {
  if (error) {
    return (
      <div className="view fade-in">
        <div className="header">
          <div className="logo-mark" aria-hidden="true">
            <AirframeLogo />
          </div>
          <div className="header__title">Airframe Setup</div>
        </div>
        <h1 className="heading-lg" style={{ marginBottom: 16 }}>Installation failed</h1>
        <ErrorDisplay error={error} />
        <div className="spacer" />
      </div>
    );
  }

  const timeStr = doneAt
    ? new Date(doneAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="view fade-in" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
      {/* Success mark */}
      <div className="success-mark" style={{ marginBottom: 24 }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 16l6 6 10-10"
            stroke="var(--color-success)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="heading-xl" style={{ marginBottom: 8 }}>
        Airframe is ready
      </h1>

      <p className="body-sm" style={{ maxWidth: 300, marginBottom: 4 }}>
        Airframe has been installed and launched.
        {timeStr && ` This window will close shortly.`}
      </p>

      {timeStr && (
        <p className="caption" style={{ marginBottom: 32 }}>
          Launched at {timeStr}
        </p>
      )}

      <AutoCloseBar />
    </div>
  );
}

/** A visual countdown bar before auto-close. */
function AutoCloseBar() {
  return (
    <div style={{ width: '100%', maxWidth: 260 }}>
      <div className="progress-bar" style={{ height: 3 }}>
        <div
          className="progress-bar__fill"
          style={{
            animation: 'drain 3s linear forwards',
            width: '100%',
          }}
        />
      </div>
      <style>{`
        @keyframes drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function AirframeLogo() {
  return (
    <img src="/favicon.png" width="22" height="22" alt="Airframe" style={{ borderRadius: 4 }} />
  );
}
