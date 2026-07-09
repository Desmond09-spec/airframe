import React from 'react';
import { Smartphone, RotateCcw } from 'lucide-react';

interface DeviceStripProps {
  onReconnect?: () => void;
}

function DeviceStrip({ onReconnect }: DeviceStripProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border">
      {/* Device icon */}
      <div className="size-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Smartphone size={13} className="text-muted-foreground" />
      </div>

      {/* Device identity */}
      <div className="min-w-0">
        <p className="text-sm font-medium">Pixel 8 Pro</p>
        <p
          className="text-xs text-muted-foreground"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          192.168.1.42 · Android 14 · Port 4747
        </p>
      </div>

      {/* Right controls */}
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
  );
}

export default DeviceStrip;
