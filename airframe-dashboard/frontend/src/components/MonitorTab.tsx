import { CircleAlert as AlertCircle, RefreshCw, Smartphone, RotateCcw, WifiOff } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { MetricCard, type Quality } from './MetricCard';
import type { ConnState } from './StatusPill';
import logo from '../assets/logo.png';

interface Metrics {
  latency: number;
  fps: number;
  bitrate: number;
  loss: number;
  quality: number;
}

interface BitratePoint {
  t: number;
  v: number;
}

interface MonitorTabProps {
  conn: ConnState;
  networkIp: string;
  remoteStream: MediaStream | null;
  metrics: Metrics;
  bitrateHistory: BitratePoint[];
  onReconnect: () => void;
}

function latencyQuality(ms: number): Quality {
  if (ms < 50) return 'good';
  if (ms <= 100) return 'warn';
  return 'bad';
}

function fpsQuality(fps: number): Quality {
  if (fps > 58) return 'good';
  if (fps >= 28) return 'warn';
  return 'bad';
}

function lossQuality(pct: number): Quality {
  if (pct < 0.3) return 'good';
  if (pct <= 1) return 'warn';
  return 'bad';
}

function signalLabel(pct: number) {
  if (pct > 80) return 'Excellent';
  if (pct > 50) return 'Fair';
  return 'Poor';
}

function signalColor(pct: number) {
  if (pct > 80) return { bar: 'bg-emerald-500', text: 'text-emerald-500' };
  if (pct > 50) return { bar: 'bg-amber-500', text: 'text-amber-500' };
  return { bar: 'bg-red-500', text: 'text-red-500' };
}

export function MonitorTab({ conn, networkIp, remoteStream, metrics, bitrateHistory, onReconnect }: MonitorTabProps) {
  const avgBitrate = bitrateHistory.length
    ? (bitrateHistory.reduce((s, p) => s + p.v, 0) / bitrateHistory.length).toFixed(1)
    : '0.0';

  const sig = signalColor(metrics.quality);

  return (
    <div className="flex gap-4 h-full">
      {/* Left column */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Preview pane */}
        <div
          className="flex-1 rounded-2xl overflow-hidden relative"
          style={{ background: '#0A0A09', minHeight: 340 }}
        >
          {conn === 'connected' && (
            <>
              {/* Rule-of-thirds grid */}
              <div
                className="absolute inset-0 opacity-[0.028]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), ' +
                    'linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                  backgroundSize: '33.33% 33.33%',
                }}
              />

              {/* Corner brackets */}
              {([
                ['top-3 left-3', 'border-t border-l'],
                ['top-3 right-3', 'border-t border-r'],
                ['bottom-12 left-3', 'border-b border-l'],
                ['bottom-12 right-3', 'border-b border-r'],
              ] as const).map(([pos, b], i) => (
                <div key={i} className={`absolute ${pos} size-4 ${b} border-white/20`} />
              ))}

              {/* Focus reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-14 border border-white/[0.07] rounded-full" />
              </div>

              {/* Live overlay — top-center */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/[0.08] text-white/70 text-xs"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  LIVE · {metrics.fps.toFixed(0)} fps · {metrics.bitrate.toFixed(1)} Mb/s
                </div>
              </div>

              {/* Device label — bottom-left */}
              <div
                className="absolute bottom-3 left-4 text-white/30 text-[11px]"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Pixel 8 Pro — Main · 1920 × 1080 · H.264
              </div>

              {/* Video stream */}
              {remoteStream && (
                <video
                  ref={(el) => {
                    if (el && el.srcObject !== remoteStream) el.srcObject = remoteStream;
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </>
          )}

          {conn === 'connecting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="size-10 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
              <p
                className="text-white/50 text-sm"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                Connecting · {networkIp || '...'}
              </p>
            </div>
          )}

          {conn === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="text-red-500/70" size={30} />
              <p className="text-white/65 text-sm font-medium">Connection lost</p>
              <p
                className="text-white/30 text-xs"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {networkIp || '—'}
              </p>
              <button
                onClick={onReconnect}
                className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white/75 text-sm hover:bg-white/[0.12] transition-colors"
              >
                <RefreshCw size={12} />
                Reconnect
              </button>
            </div>
          )}

          {conn === 'disconnected' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <WifiOff className="text-white/15" size={30} />
              {networkIp ? (
                <>
                  <p className="text-white/35 text-sm">Waiting for Capture App</p>
                  <div className="relative p-3 rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                    <QRCodeSVG
                      value={`ws://${networkIp}:4747`}
                      size={160}
                      level="H"
                      fgColor="#F5F5F3"
                      bgColor="#0A0A09"
                      style={{ borderRadius: '8px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={logo}
                        alt="Airframe"
                        className="size-10 rounded-full bg-[#181817] p-1.5"
                      />
                    </div>
                  </div>
                  <p
                    className="text-white/20 text-xs"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    ws://{networkIp}:4747
                  </p>
                </>
              ) : (
                <p
                  className="text-white/20 text-xs"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  Starting server…
                </p>
              )}
            </div>
          )}
        </div>

        {/* Device info strip */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Smartphone size={13} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {conn === 'connected' ? 'Pixel 8 Pro' : 'No device'}
            </p>
            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {networkIp || '—'} · Android 14 · Port 4747
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onReconnect}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Reconnect"
            >
              <RotateCcw size={12} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Right column — metrics */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto">
        {/* 2×2 metric grid */}
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Latency"
            value={conn === 'connected' ? metrics.latency.toFixed(0) : '--'}
            unit="ms"
            quality={conn === 'connected' ? latencyQuality(metrics.latency) : 'neutral'}
            sub={conn === 'connected' ? (metrics.latency < 50 ? 'Excellent' : metrics.latency <= 100 ? 'Good' : 'Poor') : undefined}
          />
          <MetricCard
            label="Frame Rate"
            value={conn === 'connected' ? metrics.fps.toFixed(1) : '--'}
            unit="fps"
            quality={conn === 'connected' ? fpsQuality(metrics.fps) : 'neutral'}
          />
          <MetricCard
            label="Bitrate"
            value={conn === 'connected' ? metrics.bitrate.toFixed(1) : '--'}
            unit="Mb/s"
            quality="neutral"
          />
          <MetricCard
            label="Pkt Loss"
            value={conn === 'connected' ? metrics.loss.toFixed(1) : '--'}
            unit="%"
            quality={conn === 'connected' ? lossQuality(metrics.loss) : 'neutral'}
          />
        </div>

        {/* Signal quality bar */}
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
                className={`h-full rounded-full transition-all duration-700 ${conn === 'connected' ? sig.bar : 'bg-zinc-300'}`}
                style={{ width: conn === 'connected' ? `${metrics.quality}%` : '0%' }}
              />
            </div>
            <span
              className={`text-sm font-medium tabular-nums ${conn === 'connected' ? sig.text : 'text-muted-foreground'}`}
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {conn === 'connected' ? `${Math.round(metrics.quality)}%` : '--'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {conn === 'connected' ? `${signalLabel(metrics.quality)} · 5 GHz · ch.36 · WPA3` : 'No signal'}
          </p>
        </div>

        {/* Bitrate sparkline */}
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
              avg {avgBitrate} Mb/s
            </span>
          </div>
          <div className="h-14">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bitrateHistory} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
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

        {/* Stream info */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-3"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Stream Info
          </p>
          <div className="space-y-2">
            {([
              ['Resolution', conn === 'connected' ? '1920 × 1080' : '—'],
              ['Codec',      conn === 'connected' ? 'H.264 Main' : '—'],
              ['Keyframe',   conn === 'connected' ? 'Every 2 s' : '—'],
              ['Audio',      conn === 'connected' ? 'AAC · 128 k' : '—'],
              ['Network',    conn === 'connected' ? '5 GHz · WPA3' : '—'],
            ] as const).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{k}</span>
                <span className="text-[11px] text-foreground" style={{ fontFamily: 'DM Mono, monospace' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
