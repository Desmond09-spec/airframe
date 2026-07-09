import React from 'react';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface StatusPillProps {
  state: ConnectionState;
}

function StatusPill({ state }: StatusPillProps) {
  const cfg = {
    connected: {
      dot: 'bg-emerald-500',
      label: 'Connected',
      pulse: false,
    },
    connecting: {
      dot: 'bg-amber-400',
      label: 'Connecting…',
      pulse: true,
    },
    disconnected: {
      dot: 'bg-zinc-400',
      label: 'No signal',
      pulse: false,
    },
    error: { dot: 'bg-red-500', label: 'Error', pulse: false },
  }[state];

  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
      <span
        className={`size-1.5 rounded-full flex-shrink-0 ${cfg.dot} ${
          cfg.pulse ? 'animate-pulse' : ''
        }`}
      />
      <span className="text-muted-foreground">{cfg.label}</span>
    </span>
  );
}

export default StatusPill;
