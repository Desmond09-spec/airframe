import type { PhaseState } from '../hooks/useBootstrapState';
import type { PhaseID } from '../types/events';

const PHASE_META: Record<PhaseID, string> = {
  preflight: 'System Check',
  manifest:  'Fetch Package List',
  download:  'Download',
  verify:    'Verify Integrity',
  extract:   'Extract',
  install:   'Install',
  launch:    'Launch Airframe',
};

interface StepListProps {
  phases: PhaseState[];
}

export function StepList({ phases }: StepListProps) {
  return (
    <div className="step-list" role="list">
      {phases.map(phase => (
        <div
          key={phase.id}
          className={`step step--${phase.status}`}
          role="listitem"
          aria-label={`${PHASE_META[phase.id]}: ${phase.status}`}
        >
          <div className={`step__icon step__icon--${phase.status}`}>
            {phase.status === 'active'    && <span className="spinner" />}
            {phase.status === 'complete'  && <CheckIcon />}
            {phase.status === 'error'     && <XIcon />}
          </div>
          <span className="step__label">{PHASE_META[phase.id]}</span>
        </div>
      ))}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" />
    </svg>
  );
}
