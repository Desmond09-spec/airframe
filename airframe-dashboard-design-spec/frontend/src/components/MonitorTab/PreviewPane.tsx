import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

interface PreviewPaneProps {
  connectionState: ConnectionState;
  fps?: number;
  bitrate?: number;
  onReconnect?: () => void;
}

function PreviewPane({ connectionState, fps = 60, bitrate = 8.4, onReconnect }: PreviewPaneProps) {
  return (
    <div
      className="flex-1 rounded-2xl bg-[#0A0A09] overflow-hidden relative"
      style={{ minHeight: 340 }}
    >
      {connectionState === 'connected' ? (
        <>
          {/* Layer 1: Viewfinder grid */}
          <div
            className="absolute inset-0 opacity-[0.028]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '33.33% 33.33%',
            }}
          />

          {/* Layer 2: Corner brackets */}
          {[
            ['top-3 left-3', 'border-t border-l'],
            ['top-3 right-3', 'border-t border-r'],
            ['bottom-12 left-3', 'border-b border-l'],
            ['bottom-12 right-3', 'border-b border-r'],
          ].map(([pos, b], i) => (
            <div key={i} className={`absolute ${pos} size-4 ${b} border-white/20`} />
          ))}

          {/* Layer 3: Center focus reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="size-14 border border-white/[0.07] rounded-full" />
          </div>

          {/* Layer 4: Top-center live overlay */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/[0.08] text-white/70 text-xs"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              LIVE · {fps} fps · {bitrate} Mb/s
            </div>
          </div>

          {/* Layer 5: Bottom-left device label */}
          <div
            className="absolute bottom-3 left-4 text-white/30 text-[11px]"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Pixel 8 Pro — Main · 1920 × 1080 · H.264
          </div>
        </>
      ) : connectionState === 'connecting' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="size-10 rounded-full border-2 border-white/10 border-t-white/50 animate-spin" />
          <p
            className="text-white/50 text-sm"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Connecting · 192.168.1.42
          </p>
        </div>
      ) : connectionState === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="text-red-500/70" size={30} />
          <p className="text-white/65 text-sm font-medium">Connection lost</p>
          <p
            className="text-white/30 text-xs"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            192.168.1.42 · 0:32 ago
          </p>
          <button
            onClick={onReconnect}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] text-white/75 text-sm hover:bg-white/[0.12] transition-colors"
          >
            <RefreshCw size={12} />
            Reconnect
          </button>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <WifiOff className="text-white/15" size={30} />
          <p className="text-white/35 text-sm">No device connected</p>
          <p
            className="text-white/20 text-xs"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Open Airframe on your Android device
          </p>
        </div>
      )}
    </div>
  );
}

export default PreviewPane;
