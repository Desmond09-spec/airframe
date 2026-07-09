import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import Toggle from '../Toggle';

interface SettingsTabProps {
  onSave?: () => void;
}

function SettingsTab({ onSave }: SettingsTabProps) {
  const [virtualCam, setVirtualCam] = useState(false);
  const [launchWithOBS, setLaunchWithOBS] = useState(false);
  const [port, setPort] = useState('4747');
  const [buffer, setBuffer] = useState(80);
  const [preset, setPreset] = useState('balanced');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2200);
  };

  const presets = [
    {
      id: 'performance',
      label: 'Performance',
      desc: 'Lowest latency, reduced quality',
    },
    {
      id: 'balanced',
      label: 'Balanced',
      desc: 'Optimal for most use cases',
    },
    {
      id: 'quality',
      label: 'Quality',
      desc: 'Maximum fidelity, higher latency',
    },
  ];

  return (
    <div className="max-w-lg mx-auto py-8">
      <h1 className="text-xl font-semibold tracking-tight mb-2">Receiver Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Configure stream reception and OBS integration
      </p>

      {/* OBS Integration Card */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 mb-4">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: 'DM Mono, monospace' }}
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

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Launch with OBS</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically start OBS when dashboard opens
              </p>
            </div>
            <Toggle on={launchWithOBS} onChange={setLaunchWithOBS} />
          </div>
        </div>
      </div>

      {/* Network Card */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 mb-4">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Network
        </p>

        <div>
          <label className="text-sm text-muted-foreground">Listening Port</label>
          <input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm outline-none focus:border-accent/40 transition-colors mt-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-muted-foreground">Receive Buffer</label>
            <span
              className="text-sm"
              style={{ fontFamily: 'DM Mono, monospace' }}
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
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>
      </div>

      {/* Quality Preset Card */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-4 mb-6">
        <p
          className="text-muted-foreground text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Quality Preset
        </p>

        <div className="space-y-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-150 ${
                preset === p.id
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted'
              }`}
            >
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  preset === p.id
                    ? 'border-background'
                    : 'border-muted-foreground/40'
                }`}
              >
                {preset === p.id && (
                  <div className="size-1.5 rounded-full bg-background" />
                )}
              </div>

              <div>
                <p className="text-sm font-medium">{p.label}</p>
                <p
                  className={`text-[11px] ${
                    preset === p.id ? 'opacity-55' : 'text-muted-foreground'
                  }`}
                >
                  {p.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          saved
            ? 'bg-emerald-500 text-white'
            : 'bg-foreground text-background hover:opacity-90'
        }`}
      >
        {saved && <Activity size={13} />}
        {saved ? 'Saved' : 'Save Changes'}
      </button>
    </div>
  );
}

export default SettingsTab;
