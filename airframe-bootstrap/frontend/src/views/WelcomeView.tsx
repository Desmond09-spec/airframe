import { useState, useEffect } from 'react';
import type { PackageInfo } from '../types/events';
import { GetInstallPath, StartInstall } from '../../wailsjs/go/main/App';
import { formatBytes } from '../hooks/useProgress';

interface WelcomeViewProps {
  packages: PackageInfo[];
  totalBytes: number;
  onInstall: () => void;
}

export function WelcomeView({ packages, totalBytes, onInstall }: WelcomeViewProps) {
  const [installPath, setInstallPath] = useState('');

  useEffect(() => {
    GetInstallPath().then(setInstallPath).catch(() => {});
  }, []);

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
      </div>

      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="heading-xl" style={{ marginBottom: 6 }}>
          Install Airframe
        </h1>
        <p className="body-sm">
          Professional video capture for creators.
          Setup will install Airframe on your computer.
        </p>
      </div>

      {/* Package list */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 16px 0' }}>
          <span className="heading-sm">What will be installed</span>
        </div>
        <div className="pkg-list" style={{ padding: '4px 16px 12px' }}>
          {packages.length === 0 ? (
            <div style={{ padding: '16px 0', textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 8px', width: 18, height: 18, border: '2px solid var(--color-border-med)', borderTopColor: 'var(--color-blue)' }} />
              <span className="caption">Fetching package info…</span>
            </div>
          ) : (
            packages.map(pkg => (
              <div key={pkg.id} className="pkg-item">
                <div>
                  <div className="pkg-item__name">{pkg.name}</div>
                  <div className="pkg-item__version">v{pkg.version}</div>
                </div>
                <span className="pkg-item__size">{formatBytes(pkg.sizeBytes)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Install path */}
      {installPath && (
        <div className="install-path" style={{ marginBottom: 20 }}>
          <span className="install-path__icon">
            <FolderIcon />
          </span>
          <span className="install-path__text">{installPath}</span>
        </div>
      )}

      {/* Total size */}
      {totalBytes > 0 && (
        <p className="caption" style={{ marginBottom: 12 }}>
          Total download size: <strong>{formatBytes(totalBytes)}</strong>
        </p>
      )}

      <div className="spacer" />

      {/* CTA */}
      <button
        className="btn btn--primary btn--full btn--lg"
        onClick={() => {
          StartInstall().catch(console.error);
          onInstall();
        }}
        id="btn-install"
        disabled={packages.length === 0}
      >
        Install Airframe
        {totalBytes > 0 && (
          <span style={{ opacity: 0.7, fontWeight: 400, fontSize: 13 }}>
            · {formatBytes(totalBytes)}
          </span>
        )}
      </button>

      <p className="caption" style={{ textAlign: 'center', marginTop: 10 }}>
        By installing you accept the{' '}
        <span style={{ color: 'var(--color-blue)', cursor: 'pointer' }}>Terms of Use</span>
      </p>
    </div>
  );
}

function AirframeLogo() {
  return (
    <img src="/favicon.png" width="22" height="22" alt="Airframe" style={{ borderRadius: 4 }} />
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3.5C1 2.67 1.67 2 2.5 2H5.5L7 3.5H11.5C12.33 3.5 13 4.17 13 5V10.5C13 11.33 12.33 12 11.5 12H2.5C1.67 12 1 11.33 1 10.5V3.5Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
