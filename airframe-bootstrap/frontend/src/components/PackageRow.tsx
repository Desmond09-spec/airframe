import { ProgressBar } from './ProgressBar';
import type { PackageProgress } from '../hooks/useBootstrapState';
import { formatBytes, formatSpeed } from '../hooks/useProgress';

interface PackageRowProps {
  id: string;
  name: string;
  progress: PackageProgress | undefined;
}

export function PackageRow({ id, name, progress }: PackageRowProps) {
  const pct = progress && progress.bytesTotal > 0
    ? Math.round((progress.bytesDone / progress.bytesTotal) * 100)
    : 0;

  return (
    <div className="package-row" role="listitem" aria-label={`Downloading ${name}`}>
      <div className="package-row__meta">
        <span className="package-row__name">{name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {progress && progress.speedBps > 0 && (
            <span className="package-row__speed">{formatSpeed(progress.speedBps)}</span>
          )}
          <span className="package-row__size">
            {progress
              ? `${formatBytes(progress.bytesDone)} / ${formatBytes(progress.bytesTotal)}`
              : 'Waiting…'}
          </span>
        </div>
      </div>
      <ProgressBar value={pct} indeterminate={!progress} height={4} />
    </div>
  );
}
