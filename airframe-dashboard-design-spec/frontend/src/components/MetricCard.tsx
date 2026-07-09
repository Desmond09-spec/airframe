import React from 'react';

type Quality = 'good' | 'warn' | 'bad' | 'neutral';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  quality: Quality;
  sub?: string;
}

function MetricCard({ label, value, unit, quality, sub }: MetricCardProps) {
  const valueColor = {
    good: 'text-emerald-500',
    warn: 'text-amber-500',
    bad: 'text-red-500',
    neutral: 'text-foreground',
  }[quality];

  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      {/* Section label */}
      <p
        className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-2"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </p>

      {/* Value + unit on same baseline */}
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[22px] font-medium tabular-nums leading-none ${valueColor}`}
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {unit}
          </span>
        )}
      </div>

      {/* Optional sublabel */}
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

export default MetricCard;
