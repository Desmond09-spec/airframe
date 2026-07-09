import { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  Settings,
  Mic,
  MicOff,
  Sun,
  Moon,
  FlipHorizontal,
  AlertCircle,
  Monitor,
  Smartphone,
  Activity,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Globe,
  RotateCcw,
  Zap,
  Square,
  Circle,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "android" | "windows";
type AndroidScreen = "splash" | "discovery" | "preview" | "settings";
type WindowsTab = "monitor" | "settings";
type ConnState = "connected" | "connecting" | "disconnected" | "error";

// ─── Utilities ────────────────────────────────────────────────────────────────

function genBitrate(n = 40) {
  return Array.from({ length: n }, (_, i) => ({
    t: i,
    v: +(8.2 + Math.sin(i * 0.35) * 1.1 + Math.random() * 0.5).toFixed(2),
  }));
}

function fmtTime(s: number) {
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatusPill({ state }: { state: ConnState }) {
  const cfg: Record<ConnState, { dot: string; label: string; pulse: boolean }> =
    {
      connected: { dot: "bg-emerald-500", label: "Connected", pulse: false },
      connecting: { dot: "bg-amber-400", label: "Connecting…", pulse: true },
      disconnected: { dot: "bg-zinc-400", label: "No signal", pulse: false },
      error: { dot: "bg-red-500", label: "Error", pulse: false },
    };
  const { dot, label, pulse } = cfg[state];
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-medium">
      <span
        className={`size-1.5 rounded-full flex-shrink-0 ${dot}${pulse ? " animate-pulse" : ""}`}
      />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-10 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${on ? "bg-accent" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 size-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}

// ─── Android: Splash ─────────────────────────────────────────────────────────

function AndroidSplash() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#0A0A09] select-none">
      <div className="relative flex items-center justify-center mb-9">
        <div
          className="absolute size-32 rounded-full border border-white/[0.045] animate-ping"
          style={{ animationDuration: "2.8s" }}
        />
        <div className="absolute size-[88px] rounded-full border border-white/[0.07]" />
        <div className="size-14 rounded-[18px] bg-white flex items-center justify-center shadow-xl">
          <span
            className="text-[#0A0A09] font-bold text-base tracking-tight"
            style={{ fontFamily: "Figtree,sans-serif" }}
          >
            AF
          </span>
        </div>
      </div>

      <p className="text-white text-[20px] font-semibold tracking-tight">
        Airframe
      </p>
      <p
        className="text-white/30 text-[10px] mt-1 tracking-[0.2em] uppercase"
        style={{ fontFamily: "DM Mono,monospace" }}
      >
        v2.4.0
      </p>

      <div className="mt-14 flex items-center gap-[7px]">
        {[0, 0.25, 0.5].map((d, i) => (
          <span
            key={i}
            className="size-[5px] rounded-full bg-white/25 animate-pulse"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Android: Discovery ───────────────────────────────────────────────────────

function AndroidDiscovery() {
  const [manual, setManual] = useState(false);
  const [ip, setIp] = useState("");

  const devices = [
    { name: "Studio Mac Mini", ip: "192.168.1.42", sig: 96 },
    { name: "Edit Suite — Room B", ip: "192.168.1.67", sig: 72 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A09] text-white px-5 pb-8 overflow-y-auto">
      <div className="pt-14 mb-7">
        <p
          className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2"
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          Airframe
        </p>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Find Receiver
        </h1>
        <p className="text-white/45 text-sm mt-1">Scanning local network</p>
      </div>

      {/* Scan pulse row */}
      <div className="flex items-center gap-3 mb-7">
        <div className="relative size-9 flex-shrink-0">
          <div
            className="absolute inset-0 rounded-full border border-[#4D8AFF]/25 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <div className="absolute inset-0 rounded-full border border-[#4D8AFF]/50 flex items-center justify-center">
            <Wifi size={13} className="text-[#4D8AFF]" />
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-[#4D8AFF]/35 via-[#4D8AFF]/10 to-transparent" />
        <p
          className="text-white/25 text-xs"
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          5 GHz · ch.36
        </p>
      </div>

      <p
        className="text-white/25 text-[10px] tracking-[0.2em] uppercase mb-3"
        style={{ fontFamily: "DM Mono,monospace" }}
      >
        Discovered
      </p>

      <div className="space-y-2 flex-1">
        {devices.map((d, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.05] border border-white/[0.07] hover:bg-white/[0.08] active:bg-white/[0.08] transition-colors text-left"
          >
            <div className="size-10 rounded-xl bg-white/[0.07] flex items-center justify-center flex-shrink-0">
              <Monitor size={15} className="text-white/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-tight truncate">
                {d.name}
              </p>
              <p
                className="text-white/35 text-xs mt-0.5"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                {d.ip}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex gap-[3px] items-end h-[14px]">
                {[0.35, 0.55, 0.75, 1].map((h, j) => (
                  <div
                    key={j}
                    className="w-[3px] rounded-[1px]"
                    style={{
                      height: `${h * 100}%`,
                      backgroundColor:
                        d.sig > j * 26 ? "#34C759" : "rgba(255,255,255,0.12)",
                    }}
                  />
                ))}
              </div>
              <ChevronRight size={13} className="text-white/25" />
            </div>
          </button>
        ))}

        <button
          onClick={() => setManual(!manual)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border border-dashed border-white/[0.13] hover:border-white/[0.22] transition-colors"
        >
          <Globe size={14} className="text-white/35 flex-shrink-0" />
          <span className="text-white/45 text-sm flex-1 text-left">
            Enter IP manually
          </span>
          <ChevronDown
            size={13}
            className={`text-white/25 transition-transform duration-200 ${manual ? "rotate-180" : ""}`}
          />
        </button>

        {manual && (
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.07] space-y-3">
            <input
              className="w-full bg-white/[0.07] border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#4D8AFF]/50 transition-colors"
              style={{ fontFamily: "DM Mono,monospace" }}
              placeholder="192.168.1.xxx"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
            />
            <button className="w-full py-2.5 rounded-xl bg-[#4D8AFF] text-white text-sm font-medium hover:opacity-90 transition-opacity active:opacity-90">
              Connect
            </button>
          </div>
        )}

        {/* Error state demo */}
        <div className="mt-2 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15]">
          <AlertCircle
            size={14}
            className="text-red-400 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-red-300 text-xs font-medium">
              Connection refused
            </p>
            <p className="text-red-400/60 text-xs mt-0.5">
              192.168.1.99 — port 4747 unreachable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Android: Preview ─────────────────────────────────────────────────────────

function AndroidPreview({
  isLive,
  setIsLive,
}: {
  isLive: boolean;
  setIsLive: (v: boolean) => void;
}) {
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isLive) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLive]);

  return (
    <div className="relative h-full bg-[#080808] overflow-hidden select-none">
      {/* Viewfinder grid */}
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "33.33% 33.33%",
        }}
      />

      {/* Rule-of-thirds intersections */}
      {[
        [0.333, 0.333],
        [0.667, 0.333],
        [0.333, 0.667],
        [0.667, 0.667],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute size-3"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-white/[0.18]" />
          <div className="absolute bottom-0 left-1 right-1 h-px bg-white/[0.18]" />
          <div className="absolute left-0 top-1 bottom-1 w-px bg-white/[0.18]" />
          <div className="absolute right-0 top-1 bottom-1 w-px bg-white/[0.18]" />
        </div>
      ))}

      {/* Corner brackets */}
      {[
        ["top-5 left-4", "border-t border-l"],
        ["top-5 right-4", "border-t border-r"],
        ["bottom-[72px] left-4", "border-b border-l"],
        ["bottom-[72px] right-4", "border-b border-r"],
      ].map(([pos, b], i) => (
        <div
          key={i}
          className={`absolute ${pos} size-[18px] ${b} border-white/25`}
        />
      ))}

      {/* Focus reticle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="size-[68px] border border-white/[0.12] rounded-full" />
        <div className="absolute size-1 bg-white/30 rounded-full" />
      </div>

      {/* Exposure gauge */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-35">
        <Zap size={9} className="text-white" />
        <div className="w-px h-20 bg-white/20 relative">
          <div className="absolute top-1/3 -left-[5px] w-3 h-px bg-white/60" />
        </div>
      </div>

      {/* ── Top HUD ── */}
      <div className="absolute top-0 left-0 right-0 px-4 pt-4 flex items-start justify-between z-10">
        {/* Tally / status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
            isLive
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-black/50 backdrop-blur-md text-white/60 border border-white/[0.09]"
          }`}
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          <span
            className={`size-1.5 rounded-full flex-shrink-0 ${isLive ? "bg-white animate-pulse" : "bg-white/40"}`}
          />
          {isLive ? "LIVE" : "STANDBY"}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/[0.09] text-white/55 text-xs"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            1080 · 60 fps
          </div>
          <button
            onClick={() => setMuted(!muted)}
            className="size-8 rounded-full bg-black/50 backdrop-blur-md border border-white/[0.09] flex items-center justify-center"
          >
            {muted ? (
              <MicOff size={12} className="text-red-400" />
            ) : (
              <Mic size={12} className="text-white/55" />
            )}
          </button>
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-16 bg-gradient-to-t from-black/65 via-black/15 to-transparent z-10">
        <div className="flex items-center justify-between">
          <button className="size-11 rounded-full bg-white/[0.09] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center">
            <FlipHorizontal size={15} className="text-white/75" />
          </button>

          <button
            onClick={() => setIsLive(!isLive)}
            className={`size-[68px] rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
              isLive
                ? "border-red-400/80 bg-red-500/20 shadow-lg shadow-red-500/20"
                : "border-white/30 bg-white/[0.07]"
            }`}
          >
            {isLive ? (
              <Square size={20} className="text-red-400 fill-red-400" />
            ) : (
              <Circle size={24} className="text-white/80 fill-white/80" />
            )}
          </button>

          <button className="size-11 rounded-full bg-white/[0.09] backdrop-blur-sm border border-white/[0.12] flex items-center justify-center">
            <Settings size={15} className="text-white/75" />
          </button>
        </div>

        {isLive && (
          <p
            className="mt-3 text-center text-white/40 text-xs"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            {fmtTime(elapsed)} · 8.4 Mbps
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Android: Settings ────────────────────────────────────────────────────────

function AndroidSettings() {
  const [res, setRes] = useState("1080p");
  const [fps, setFps] = useState("60");
  const [bitrate, setBitrate] = useState(8);
  const [audio, setAudio] = useState(true);
  const [reconnect, setReconnect] = useState(true);

  return (
    <div className="h-full bg-[#0A0A09] text-white overflow-y-auto">
      <div className="px-5 pt-14 pb-10 space-y-7">
        <div>
          <p
            className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Airframe
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight">Capture</h1>
        </div>

        {/* Resolution */}
        <div>
          <p
            className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Resolution
          </p>
          <div className="flex gap-2">
            {["4K", "1080p", "720p"].map((r) => (
              <button
                key={r}
                onClick={() => setRes(r)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  res === r
                    ? "bg-white text-[#0A0A09]"
                    : "bg-white/[0.06] text-white/50 border border-white/[0.08]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Frame Rate */}
        <div>
          <p
            className="text-white/30 text-[10px] tracking-[0.2em] uppercase mb-3"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Frame Rate
          </p>
          <div className="flex gap-2">
            {["60", "30", "24"].map((f) => (
              <button
                key={f}
                onClick={() => setFps(f)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  fps === f
                    ? "bg-white text-[#0A0A09]"
                    : "bg-white/[0.06] text-white/50 border border-white/[0.08]"
                }`}
              >
                {f} fps
              </button>
            ))}
          </div>
        </div>

        {/* Bitrate */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p
              className="text-white/30 text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              Bitrate
            </p>
            <span
              className="text-white text-sm"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              {bitrate} Mbps
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={20}
            value={bitrate}
            onChange={(e) => setBitrate(Number(e.target.value))}
            className="w-full h-[3px] rounded-full appearance-none cursor-pointer"
            style={{
              accentColor: "#4D8AFF",
              background: `linear-gradient(to right,#4D8AFF ${((bitrate - 2) / 18) * 100}%,rgba(255,255,255,0.12) 0)`,
            }}
          />
          <div className="flex justify-between mt-1.5">
            <span
              className="text-white/25 text-[10px]"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              2 Mbps
            </span>
            <span
              className="text-white/25 text-[10px]"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              20 Mbps
            </span>
          </div>
        </div>

        {/* Toggles */}
        <div className="divide-y divide-white/[0.06]">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">Include Audio</p>
              <p className="text-white/35 text-xs mt-0.5">
                Stream device microphone
              </p>
            </div>
            <Toggle on={audio} onChange={setAudio} />
          </div>
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">Auto-Reconnect</p>
              <p className="text-white/35 text-xs mt-0.5">
                Retry on connection loss
              </p>
            </div>
            <Toggle on={reconnect} onChange={setReconnect} />
          </div>
        </div>

        {/* Network details */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.05]">
          {[
            ["Port", "4747"],
            ["Timeout", "10 s"],
            ["Protocol", "TCP / UDP"],
            ["Auth", "None"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm text-white/55">{k}</span>
              <span
                className="text-xs text-white/35"
                style={{ fontFamily: "DM Mono,monospace" }}
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

// ─── Windows: Metric card ─────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  unit,
  quality = "neutral",
  sub,
}: {
  label: string;
  value: string;
  unit?: string;
  quality?: "good" | "warn" | "bad" | "neutral";
  sub?: string;
}) {
  const vc = {
    good: "text-emerald-500",
    warn: "text-amber-500",
    bad: "text-red-500",
    neutral: "text-foreground",
  }[quality];
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p
        className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-2"
        style={{ fontFamily: "DM Mono,monospace" }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[22px] font-medium tabular-nums leading-none ${vc}`}
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-xs text-muted-foreground"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

function SignalBar({ pct }: { pct: number }) {
  const c =
    pct > 80 ? "bg-emerald-500" : pct > 50 ? "bg-amber-500" : "bg-red-500";
  const l = pct > 80 ? "Excellent" : pct > 50 ? "Fair" : "Poor";
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <p
        className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-3"
        style={{ fontFamily: "DM Mono,monospace" }}
      >
        Signal Quality
      </p>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${c}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-sm font-medium tabular-nums ${c}`}
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          {pct}%
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {l} · 5 GHz · ch.36 · WPA3
      </p>
    </div>
  );
}

function BitrateChart({ data }: { data: { t: number; v: number }[] }) {
  const avg = (data.reduce((a, d) => a + d.v, 0) / data.length).toFixed(1);
  return (
    <div className="p-4 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          Bitrate · 30 s
        </p>
        <span
          className="text-xs text-muted-foreground"
          style={{ fontFamily: "DM Mono,monospace" }}
        >
          avg {avg} Mb/s
        </span>
      </div>
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="bgrad" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.28}
                />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill="url(#bgrad)"
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              content={({ payload }) =>
                payload?.[0] ? (
                  <div
                    className="text-[11px] bg-card border border-border px-2 py-1 rounded-lg shadow-lg"
                    style={{ fontFamily: "DM Mono,monospace" }}
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
  );
}

// ─── Windows: Monitor ─────────────────────────────────────────────────────────

function WindowsMonitor({
  conn,
  onReconnect,
}: {
  conn: ConnState;
  onReconnect: () => void;
}) {
  const [data, setData] = useState(genBitrate);
  const [m, setM] = useState({
    latency: 24,
    fps: 59.9,
    bitrate: 8.4,
    loss: 0.0,
    quality: 94,
  });

  useEffect(() => {
    if (conn !== "connected") return;
    const id = setInterval(() => {
      setData((prev) => [
        ...prev.slice(1),
        {
          t: prev[prev.length - 1].t + 1,
          v: +(
            8.2 +
            Math.sin(Date.now() / 3200) * 1.1 +
            Math.random() * 0.45
          ).toFixed(2),
        },
      ]);
      setM((p) => ({
        latency: Math.max(
          10,
          Math.min(140, p.latency + (Math.random() - 0.48) * 4),
        ),
        fps: Math.max(55, Math.min(60.1, p.fps + (Math.random() - 0.5) * 0.15)),
        bitrate: Math.max(
          6,
          Math.min(12, p.bitrate + (Math.random() - 0.5) * 0.35),
        ),
        loss: Math.max(
          0,
          Math.min(1.5, p.loss + (Math.random() - 0.52) * 0.06),
        ),
        quality: Math.max(
          82,
          Math.min(99, p.quality + (Math.random() - 0.5) * 1.5),
        ),
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [conn]);

  const live = conn === "connected";

  return (
    <div className="flex gap-4 h-full">
      {/* ── Preview pane ── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex-1 rounded-2xl bg-[#0A0A09] overflow-hidden relative">
          {live && (
            <>
              {/* Grid */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
                  backgroundSize: "33.33% 33.33%",
                }}
              />
              {/* Corner marks */}
              {[
                ["top-3 left-3", "border-t border-l"],
                ["top-3 right-3", "border-t border-r"],
                ["bottom-10 left-3", "border-b border-l"],
                ["bottom-10 right-3", "border-b border-r"],
              ].map(([pos, b], i) => (
                <div
                  key={i}
                  className={`absolute ${pos} size-4 ${b} border-white/20`}
                />
              ))}
              {/* Focus reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-12 border border-white/[0.08] rounded-full" />
              </div>
              {/* Live overlay */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/[0.08] text-white/70 text-xs"
                  style={{ fontFamily: "DM Mono,monospace" }}
                >
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  LIVE · {m.fps.toFixed(0)} fps · {m.bitrate.toFixed(1)} Mb/s
                </div>
              </div>
              {/* Device label */}
              <div
                className="absolute bottom-3 left-4 text-white/30 text-[11px]"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                Pixel 8 Pro — Main · 1920 × 1080 · H.264
              </div>
            </>
          )}

          {conn === "connecting" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="size-10 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
              <p
                className="text-white/50 text-sm"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                Connecting · 192.168.1.42
              </p>
            </div>
          )}

          {conn === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="text-red-500/70" size={30} />
              <p className="text-white/65 text-sm font-medium">
                Connection lost
              </p>
              <p
                className="text-white/30 text-xs"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                192.168.1.42 · 0:32 ago
              </p>
              <button
                onClick={onReconnect}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white/75 text-sm hover:bg-white/[0.12] transition-colors"
              >
                <RefreshCw size={12} />
                Reconnect
              </button>
            </div>
          )}

          {conn === "disconnected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <WifiOff className="text-white/15" size={30} />
              <p className="text-white/35 text-sm">No device connected</p>
              <p
                className="text-white/20 text-xs"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                Open Airframe on your Android device
              </p>
            </div>
          )}
        </div>

        {/* Device info strip */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Smartphone size={13} className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Pixel 8 Pro</p>
            <p
              className="text-xs text-muted-foreground truncate"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              192.168.1.42 · Android 14 · Port 4747
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <StatusPill state={conn} />
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

      {/* ── Metrics panel ── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <MetricCard
            label="Latency"
            value={m.latency.toFixed(0)}
            unit="ms"
            quality={m.latency < 50 ? "good" : m.latency < 100 ? "warn" : "bad"}
            sub={
              m.latency < 50
                ? "Excellent"
                : m.latency < 100
                  ? "High"
                  : "Critical"
            }
          />
          <MetricCard
            label="Frame Rate"
            value={m.fps.toFixed(1)}
            unit="fps"
            quality={m.fps > 58 ? "good" : m.fps > 28 ? "warn" : "bad"}
          />
          <MetricCard
            label="Bitrate"
            value={m.bitrate.toFixed(1)}
            unit="Mb/s"
            quality="neutral"
          />
          <MetricCard
            label="Pkt Loss"
            value={m.loss.toFixed(1)}
            unit="%"
            quality={m.loss < 0.3 ? "good" : m.loss < 1 ? "warn" : "bad"}
          />
        </div>

        <SignalBar pct={Math.round(m.quality)} />
        <BitrateChart data={data} />

        {/* Stream info */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase mb-3"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Stream Info
          </p>
          <div className="space-y-2">
            {[
              ["Resolution", "1920 × 1080"],
              ["Codec", "H.264 Main"],
              ["Keyframe", "Every 2 s"],
              ["Audio", "AAC · 128 k"],
              ["Network", "5 GHz · WPA3"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{k}</span>
                <span
                  className="text-[11px] text-foreground"
                  style={{ fontFamily: "DM Mono,monospace" }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Windows: Settings ────────────────────────────────────────────────────────

function WindowsSettings() {
  const [port, setPort] = useState("4747");
  const [buffer, setBuffer] = useState(80);
  const [preset, setPreset] = useState("balanced");
  const [virtualCam, setVirtualCam] = useState(true);
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="h-full overflow-y-auto pr-1">
      <div className="max-w-lg space-y-5 pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Receiver Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure stream reception and OBS integration.
          </p>
        </div>

        {/* OBS integration */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            OBS Integration
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Virtual Camera Output</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Expose stream as a camera source in OBS
              </p>
            </div>
            <Toggle on={virtualCam} onChange={setVirtualCam} />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium">Launch with OBS</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Start receiver when OBS opens
              </p>
            </div>
            <Toggle on={autoLaunch} onChange={setAutoLaunch} />
          </div>
        </div>

        {/* Network */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Network
          </p>
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">
              Listening Port
            </label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-accent/40 transition-colors"
              style={{ fontFamily: "DM Mono,monospace" }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-muted-foreground">
                Receive Buffer
              </label>
              <span
                className="text-sm"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                {buffer} ms
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: "var(--accent)" }}
            />
            <div className="flex justify-between mt-1">
              <span
                className="text-[10px] text-muted-foreground"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                0 ms
              </span>
              <span
                className="text-[10px] text-muted-foreground"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                500 ms
              </span>
            </div>
          </div>
        </div>

        {/* Quality preset */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
          <p
            className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "DM Mono,monospace" }}
          >
            Quality Preset
          </p>
          {[
            {
              id: "performance",
              label: "Performance",
              desc: "Lowest latency, reduced fidelity",
            },
            {
              id: "balanced",
              label: "Balanced",
              desc: "Optimal for most production use",
            },
            {
              id: "quality",
              label: "Quality",
              desc: "Maximum fidelity, higher latency",
            },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                preset === p.id
                  ? "bg-foreground text-background"
                  : "hover:bg-muted"
              }`}
            >
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  preset === p.id
                    ? "border-background"
                    : "border-muted-foreground/40"
                }`}
              >
                {preset === p.id && (
                  <div className="size-1.5 rounded-full bg-background" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p
                  className={`text-[11px] ${preset === p.id ? "opacity-55" : "text-muted-foreground"}`}
                >
                  {p.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={save}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-foreground text-background hover:opacity-90"
          }`}
        >
          {saved && <Activity size={13} />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [plat, setPlat] = useState<Platform>("android");
  const [screen, setScreen] = useState<AndroidScreen>("preview");
  const [winTab, setWinTab] = useState<WindowsTab>("monitor");
  const [isLive, setIsLive] = useState(false);
  const [conn, setConn] = useState<ConnState>("connected");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const reconnect = useCallback(() => {
    setConn("connecting");
    setTimeout(() => setConn("connected"), 2200);
  }, []);

  const aScreens: { id: AndroidScreen; label: string }[] = [
    { id: "splash", label: "Splash" },
    { id: "discovery", label: "Discover" },
    { id: "preview", label: "Preview" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Figtree,system-ui,sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-[52px] flex items-center gap-4">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5 mr-2">
            <div className="size-6 rounded-md bg-foreground flex items-center justify-center flex-shrink-0">
              <span
                className="text-background text-[10px] font-bold tracking-tight"
                style={{ fontFamily: "Figtree,sans-serif" }}
              >
                AF
              </span>
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Airframe
            </span>
            <span
              className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              2.4
            </span>
          </div>

          {/* Platform tabs */}
          <nav
            className="flex items-center gap-0.5 p-1 rounded-xl bg-muted"
            role="tablist"
          >
            {(["android", "windows"] as Platform[]).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={plat === p}
                onClick={() => setPlat(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  plat === p
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "android" ? (
                  <Smartphone size={13} />
                ) : (
                  <Monitor size={13} />
                )}
                {p === "android" ? "Android" : "Windows"}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* State picker (Windows only) */}
            {plat === "windows" && (
              <select
                value={conn}
                onChange={(e) => setConn(e.target.value as ConnState)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground outline-none cursor-pointer"
                style={{ fontFamily: "DM Mono,monospace" }}
              >
                <option value="connected">● Connected</option>
                <option value="connecting">◌ Connecting</option>
                <option value="disconnected">○ Disconnected</option>
                <option value="error">✕ Error</option>
              </select>
            )}

            {/* Theme toggle */}
            <button
              onClick={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
              className="size-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon size={13} className="text-muted-foreground" />
              ) : (
                <Sun size={13} className="text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* ── Android view ── */}
        {plat === "android" && (
          <div className="flex flex-col items-center gap-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Android Transmitter
              </h2>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-xs mx-auto">
                Streams wirelessly over local network to the Windows receiver.
                Tap Preview and press the record button.
              </p>
            </div>

            {/* Phone frame */}
            <div className="relative" style={{ width: 312, height: 636 }}>
              {/* Shell */}
              <div
                className="absolute inset-0 rounded-[44px] bg-[#1C1C1E]"
                style={{
                  boxShadow:
                    "0 50px 100px -20px rgba(0,0,0,0.38),0 16px 40px -8px rgba(0,0,0,0.22),inset 0 0 0 1px rgba(255,255,255,0.09)",
                }}
              >
                {/* Screen bezel */}
                <div
                  className="absolute inset-[7px] rounded-[38px] bg-[#0A0A09] overflow-hidden"
                  style={{
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Dynamic Island */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-[88px] h-[26px] bg-black rounded-full z-20 flex items-center justify-center gap-2.5">
                    <div className="size-[7px]  rounded-full bg-[#1A1A1A]" />
                    <div className="size-[11px] rounded-full bg-[#1A1A1A]" />
                  </div>

                  {/* Screen content */}
                  <div className="absolute inset-0">
                    {screen === "splash" && <AndroidSplash />}
                    {screen === "discovery" && <AndroidDiscovery />}
                    {screen === "preview" && (
                      <AndroidPreview isLive={isLive} setIsLive={setIsLive} />
                    )}
                    {screen === "settings" && <AndroidSettings />}
                  </div>

                  {/* Home bar */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-1 bg-white/20 rounded-full z-20" />
                </div>
              </div>

              {/* Side buttons */}
              <div className="absolute -right-[3px] top-[100px] w-[3px] h-14 bg-[#2C2C2E] rounded-r-sm" />
              <div className="absolute -left-[3px] top-[88px]  w-[3px] h-9  bg-[#2C2C2E] rounded-l-sm" />
              <div className="absolute -left-[3px] top-[134px] w-[3px] h-9  bg-[#2C2C2E] rounded-l-sm" />
            </div>

            {/* Screen nav */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-muted">
              {aScreens.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScreen(s.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    screen === s.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Screen annotation */}
            <div className="h-9 flex items-center">
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {screen === "splash" &&
                  "Launch screen — immediate brand presence with a minimal initialization animation."}
                {screen === "discovery" &&
                  "Auto-scans local network for receivers. Tap any device to connect, or enter an IP manually."}
                {screen === "preview" &&
                  "Full-bleed capture preview. Tap the button to go live — all controls step aside for the image."}
                {screen === "settings" &&
                  "Resolution, frame rate, bitrate, and audio — designed for fast adjustments between takes."}
              </p>
            </div>
          </div>
        )}

        {/* ── Windows view ── */}
        {plat === "windows" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Windows Receiver
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Monitors the incoming stream from Airframe on Android. Switch
                connection states via the header selector.
              </p>
            </div>

            {/* Window chrome */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xl">
              {/* Title bar */}
              <div className="flex items-center px-4 h-10 bg-muted/60 border-b border-border">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-red-400/70" />
                  <div className="size-3 rounded-full bg-amber-400/70" />
                  <div className="size-3 rounded-full bg-emerald-400/70" />
                </div>
                <span
                  className="text-xs text-muted-foreground mx-auto"
                  style={{ fontFamily: "DM Mono,monospace" }}
                >
                  Airframe Receiver · 2.4.0
                </span>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-6 rounded-md bg-foreground flex items-center justify-center flex-shrink-0">
                    <span className="text-background text-[10px] font-bold">
                      AF
                    </span>
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    Airframe
                  </span>
                </div>

                <div className="flex items-center gap-0.5 ml-4">
                  {(["monitor", "settings"] as WindowsTab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setWinTab(t)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${
                        winTab === t
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "monitor" ? (
                        <Activity size={12} />
                      ) : (
                        <Settings size={12} />
                      )}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="ml-auto">
                  <StatusPill state={conn} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5" style={{ height: 560 }}>
                {winTab === "monitor" ? (
                  <WindowsMonitor conn={conn} onReconnect={reconnect} />
                ) : (
                  <WindowsSettings />
                )}
              </div>
            </div>

            <p
              className="text-center text-[11px] text-muted-foreground"
              style={{ fontFamily: "DM Mono,monospace" }}
            >
              Tabs: Monitor · Settings — Connection state: header selector
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
