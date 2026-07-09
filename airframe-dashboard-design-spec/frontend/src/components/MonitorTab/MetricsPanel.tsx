import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import MetricCard from '../MetricCard';

interface MetricsPanelProps {
  latency: number;
  fps: number;
  bitrate: number;
  packetLoss: number;
  signalQuality: number;
  bitrateHistory: { t: number; v: number }[];
}

function MetricsPanel({
  latency,
  fps,
  bitrate,
  packetLoss,
  signalQuality,
  bitrateHistory,
}: MetricsPanelProps) {
  const avgBitrate = bitrateHistory.reduce((sum, p) => sum + p.v, 0) / bitrateHistory.length;

  const getQualityColor = (value: number, type: 'latency' | 'fps' | 'loss') => {
    if (type === 'latency') {
      if (value < 50) return 'good';
      if (value < 100) return 'warn';
      return 'bad';
    }
    if (type === 'fps') {
      if (value > 58) return 'good';
      if (value > 28) return 'warn';
      return 'bad';
    }
    if (type === 'loss') {
      if (value < 0.3) return 'good';
      if (value < 1) return 'warn';
      return 'bad';
    }
    return 'neutral';
  };

  const getSignalColor = (pct: number) => {
    if (pct > 80) return { color: 'bg-emerald-500', text: 'text-emerald-500', label: 'Excellent' };
    if (pct > 50) return { color: 'bg-amber-500', text: 'text-amber-500', label: 'Fair' };
    return { color: 'bg-red-500', text: 'text-red-500', label: 'Poor' };
  };

  const signalColor = getSignalColor(signalQuality);

  return (
    <div className="w-60 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto">
      {/* 2×2 Metric Card grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="LATENCY"
          value={latency.toString()}
          unit="ms"
          quality={getQualityColor(latency, 'latency')}
        />
        <MetricCard
          label="FRAME RATE"
          value={fps.toFixed(1)}
          unit="fps"
          quality={getQualityColor(fps, 'fps')}
        />
        <MetricCard
          label="BITRATE"
          value={bitrate.toFixed(1)}
          unit="Mb/s"
          quality="neutral"
        />
        <MetricCard
          label="PKT LOSS"
          value={packetLoss.toFixed(1)}
          unit="%"
          quality={getQualityColor(packetLoss, 'loss')}
        />
      </div>

      {/* Signal Quality Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-3"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Signal Quality
        </p>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${signalColor.color}`}
              style={{ width: `${signalQuality}%` }}
            />
          </div>
          <span
            className={`text-sm font-medium tabular-nums ${signalColor.text}`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {signalQuality}%
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {signalColor.label} · 5 GHz · ch.36 · WPA3
        </p>
      </div>

      {/* Bitrate Sparkline */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Bitrate · 30 s
          </p>
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            avg {avgBitrate.toFixed(1)} Mb/s
          </span>
        </div>

        <div className="h-14">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={bitrateHistory}
              margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="bitrateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--chart-1)"
                strokeWidth={1.5}
                fill="url(#bitrateGrad)"
                dot={false}
                isAnimationActive={false}
              />

              <Tooltip
                content={({ payload }) =>
                  payload?.[0] ? (
                    <div
                      className="text-[11px] bg-card border border-border px-2 py-1 rounded-lg shadow-lg"
                      style={{ fontFamily: 'DM Mono, monospace' }}
                    >
                      {Number(payload[0].value).toFixed(1)} Mb/s
                    </div>
                  ) : null
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stream Info Table */}
      <div className="p-4 rounded-2xl bg-card border border-border">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-3"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Stream Info
        </p>

        <div className="space-y-2">
          {[
            ['Resolution', '1920 × 1080'],
            ['Codec', 'H.264 Main'],
            ['Keyframe', 'Every 2 s'],
            ['Audio', 'AAC · 128 k'],
            ['Network', '5 GHz · WPA3'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{k}</span>
              <span
                className="text-[11px] text-foreground"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MetricsPanel;
