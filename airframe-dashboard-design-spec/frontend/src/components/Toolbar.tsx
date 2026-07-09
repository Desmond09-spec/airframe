import React, { useState } from 'react';
import { Activity, Settings } from 'lucide-react';
import StatusPill from './StatusPill';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface ToolbarProps {
  connectionState: ConnectionState;
  onConnectionStateChange: (state: ConnectionState) => void;
}

function Toolbar({ connectionState, onConnectionStateChange }: ToolbarProps) {
  const [activeTab, setActiveTab] = useState<'monitor' | 'settings'>('monitor');

  return (
    <div className="px-6 py-3 bg-card border-b border-border flex items-center">
      {/* Logo group */}
      <div className="flex items-center gap-2">
        {/* Icon mark — 28px square */}
        <div className="size-7 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
          <span
            className="text-background text-xs font-bold"
            style={{ fontFamily: 'Figtree, sans-serif' }}
          >
            AF
          </span>
        </div>

        {/* Word mark */}
        <span className="font-semibold tracking-tight">Airframe</span>

        {/* Sub-label */}
        <span className="text-muted-foreground text-sm">Receiver</span>
      </div>

      {/* Tab group */}
      <div className="flex items-center gap-0.5 ml-4">
        {(['monitor', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'monitor' ? (
              <Activity size={13} />
            ) : (
              <Settings size={13} />
            )}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Demo-only: connection state selector */}
        <select
          value={connectionState}
          onChange={(e) => onConnectionStateChange(e.target.value as ConnectionState)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground outline-none cursor-pointer"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          <option value="connected">● Connected</option>
          <option value="connecting">◌ Connecting</option>
          <option value="disconnected">○ Disconnected</option>
          <option value="error">✕ Error</option>
        </select>

        {/* Status pill */}
        <StatusPill state={connectionState} />
      </div>
    </div>
  );
}

export default Toolbar;
