import { StepList } from '../components/StepList';
import { PackageRow } from '../components/PackageRow';
import { ProgressBar } from '../components/ProgressBar';
import { ErrorDisplay } from '../components/ErrorDisplay';
import type { BootstrapState } from '../hooks/useBootstrapState';
import { useProgress } from '../hooks/useProgress';
import { Cancel } from '../../wailsjs/go/main/App';

interface InstallViewProps {
  state: BootstrapState;
}

export function InstallView({ state }: InstallViewProps) {
  const pct = useProgress(state.progress);
  const isDownloading = state.activePhase === 'download';
  const isIndeterminate = !isDownloading;

  const activePhaseState = state.phases.find(p => p.id === state.activePhase);
  const statusMsg = activePhaseState?.message ?? '';

  function handleCancel() {
    Cancel().catch(console.error);
  }

  return (
    <div className="view fade-in">
      {/* Header */}
      <div className="header">
        <div className="logo-mark" aria-hidden="true">
          <AirframeLogo />
        </div>
        <div>
          <div className="header__title">Airframe Setup</div>
        </div>
        {isDownloading && (
          <span className="header__version">{pct}%</span>
        )}
      </div>

      <h1 className="heading-lg" style={{ marginBottom: 4 }}>
        Installing…
      </h1>
      <p className="status-message" style={{ marginBottom: 20 }}>
        {statusMsg || 'Preparing installation…'}
      </p>

      {/* Overall progress bar */}
      <ProgressBar
        value={pct}
        indeterminate={isIndeterminate}
        height={6}
      />

      <div className="divider" />

      {/* Step list */}
      <StepList phases={state.phases} />

      {/* Package rows — shown only during download phase */}
      {isDownloading && state.packages.length > 0 && (
        <div className="card" style={{ marginTop: 16 }} role="list" aria-label="Package downloads">
          {state.packages.map(pkg => (
            <PackageRow
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              progress={state.progress[pkg.id]}
            />
          ))}
        </div>
      )}

      {/* Error inline */}
      {state.error && (
        <div style={{ marginTop: 16 }}>
          <ErrorDisplay error={state.error} />
        </div>
      )}

      <div className="spacer" />

      {/* Cancel */}
      {!state.error && (
        <button
          className="btn btn--ghost"
          onClick={handleCancel}
          id="btn-cancel"
          style={{ alignSelf: 'center' }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function AirframeLogo() {
  return (
    <img src="/favicon.png" width="22" height="22" alt="Airframe" style={{ borderRadius: 4 }} />
  );
}
