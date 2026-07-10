interface ProgressBarProps {
  value: number;          // 0–100, ignored in indeterminate mode
  indeterminate?: boolean;
  height?: number;        // px, default 6
}

export function ProgressBar({ value, indeterminate = false, height = 6 }: ProgressBarProps) {
  return (
    <div
      className={`progress-bar${indeterminate ? ' progress-bar--indeterminate' : ''}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar__fill"
        style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
