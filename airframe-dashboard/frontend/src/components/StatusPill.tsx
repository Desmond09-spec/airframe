export type ConnState = 'connected' | 'connecting' | 'disconnected' | 'error';

const cfg: Record<ConnState, { dot: string; label: string; pulse: boolean }> = {
  connected:    { dot: 'bg-emerald-500', label: 'Connected',    pulse: false },
  connecting:   { dot: 'bg-amber-400',   label: 'Connecting…',  pulse: true  },
  disconnected: { dot: 'bg-zinc-400',    label: 'No signal',    pulse: false },
  error:        { dot: 'bg-red-500',     label: 'Error',        pulse: false },
};

export function StatusPill({ state }: { state: ConnState }) {
  const c = cfg[state];
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
      <span className={`size-1.5 rounded-full flex-shrink-0 ${c.dot} ${c.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-muted-foreground">{c.label}</span>
    </span>
  );
}
