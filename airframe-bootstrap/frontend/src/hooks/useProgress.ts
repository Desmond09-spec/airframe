import type { PackageProgress } from './useBootstrapState';

/**
 * Derives an aggregate download progress percentage [0–100]
 * from the per-package progress map.
 */
export function useProgress(progress: Record<string, PackageProgress>): number {
  const entries = Object.values(progress);
  if (entries.length === 0) return 0;

  let done = 0;
  let total = 0;
  for (const p of entries) {
    done += p.bytesDone;
    total += p.bytesTotal;
  }
  if (total === 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

/** Formats bytes as a human-readable string (e.g. "48.2 MB"). */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576)     return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1_024)         return `${(bytes / 1_024).toFixed(0)} KB`;
  return `${bytes} B`;
}

/** Formats bytes-per-second as a speed badge label (e.g. "12.4 MB/s"). */
export function formatSpeed(bps: number): string {
  if (bps >= 1_073_741_824) return `${(bps / 1_073_741_824).toFixed(1)} GB/s`;
  if (bps >= 1_048_576)     return `${(bps / 1_048_576).toFixed(1)} MB/s`;
  if (bps >= 1_024)         return `${(bps / 1_024).toFixed(0)} KB/s`;
  return `${bps} B/s`;
}
