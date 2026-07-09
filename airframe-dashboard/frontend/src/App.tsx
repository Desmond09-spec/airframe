import { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, Settings } from 'lucide-react';
import { GetNetworkIP } from '../wailsjs/go/main/App';
import { StatusPill, type ConnState } from './components/StatusPill';
import { MonitorTab } from './components/MonitorTab';
import { SettingsTab } from './components/SettingsTab';
import logoBlack  from './assets/logo.png'

const WS_URL = 'ws://127.0.0.1:4747';

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function drift(mag: number) {
  return (Math.random() - 0.5) * mag;
}

function initBitrateHistory() {
  return Array.from({ length: 30 }, (_, i) => ({ t: i, v: 0 }));
}

type Tab = 'monitor' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('monitor');
  const [connState, setConnState] = useState<ConnState>('connecting');
  const [networkIp, setNetworkIp] = useState<string>('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [metrics, setMetrics] = useState({
    latency: 24,
    fps: 59.6,
    bitrate: 8.4,
    loss: 0.0,
    quality: 94,
  });
  const [bitrateHistory, setBitrateHistory] = useState(initBitrateHistory);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const connStateRef = useRef<ConnState>('connecting');
  connStateRef.current = connState;

  // Simulated metric drift (used when real stats aren't available)
  useEffect(() => {
    if (connState !== 'connected') return;
    const id = setInterval(() => {
      setMetrics((p) => {
        const next = {
          latency: clamp(p.latency + drift(4), 10, 140),
          fps:     clamp(p.fps     + drift(0.15), 55, 60.1),
          bitrate: clamp(p.bitrate + drift(0.35),  6, 12),
          loss:    clamp(p.loss    + drift(0.06),   0, 1.5),
          quality: clamp(p.quality + drift(1.5),   82, 99),
        };
        setBitrateHistory((prev) => [
          ...prev.slice(1),
          { t: prev[prev.length - 1].t + 1, v: next.bitrate },
        ]);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [connState]);

  // Real WebRTC stats overlay
  useEffect(() => {
    if (connState !== 'connected' || !pcRef.current) return;
    let prevBytes = 0;
    let prevTs = Date.now();
    const poll = async () => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        const report = await pc.getStats();
        report.forEach((stat) => {
          if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
            const bytes: number = stat.bytesReceived || 0;
            const ts: number = stat.timestamp || Date.now();
            if (prevBytes > 0) {
              const mbps = ((bytes - prevBytes) * 8) / ((ts - prevTs) / 1000) / 1e6;
              const v = clamp(mbps, 0, 100);
              setMetrics((p) => ({ ...p, bitrate: v }));
              setBitrateHistory((prev) => [
                ...prev.slice(1),
                { t: prev[prev.length - 1].t + 1, v },
              ]);
            }
            prevBytes = bytes;
            prevTs = ts;
          }
          if (stat.type === 'remote-inbound-rtp' && stat.mediaType === 'video' && stat.roundTripTime) {
            setMetrics((p) => ({ ...p, latency: Math.round(stat.roundTripTime * 1000) }));
          }
          if (stat.type === 'inbound-rtp' && stat.mediaType === 'video' && stat.framesPerSecond) {
            setMetrics((p) => ({ ...p, fps: stat.framesPerSecond as number }));
          }
        });
      } catch {
        // stat errors are non-critical
      }
    };
    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, [connState]);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'candidate', role: 'receiver', payload: event.candidate }));
      }
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnState('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnState('error');
        setRemoteStream(null);
      }
    };
    pc.ontrack = (event) => {
      if (event.streams[0]) setRemoteStream(event.streams[0]);
    };
    pcRef.current = pc;
    return pc;
  }, []);

  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    const pc = pcRef.current || createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'answer', role: 'receiver', payload: pc.localDescription }));
    }
  }, [createPeerConnection]);

  const handleCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current?.remoteDescription) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const connectSignaling = useCallback(() => {
    setConnState('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnState('disconnected');
      ws.send(JSON.stringify({ type: 'join', role: 'receiver' }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'receiver') return;
        if (data.type === 'offer') {
          setConnState('connecting');
          await handleOffer(data.payload);
        } else if (data.type === 'candidate') {
          await handleCandidate(data.payload);
        }
      } catch (err) {
        console.error('[ws] parse error', err);
      }
    };

    ws.onclose = () => {
      if (connStateRef.current !== 'error') setConnState('connecting');
      setRemoteStream(null);
      setTimeout(connectSignaling, 3000);
    };
  }, [handleOffer, handleCandidate]);

  const reconnect = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      setConnState('disconnected');
    } else {
      connectSignaling();
    }
  }, [connectSignaling]);

  useEffect(() => {
    GetNetworkIP().then((ip) => {
      setNetworkIp(ip);
      connectSignaling();
    });
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, [connectSignaling]);

  return (
    <div
      className="h-full flex flex-col bg-background text-foreground"
      style={{ fontFamily: 'Figtree, system-ui, sans-serif' }}
    >
      {/* Toolbar */}
      <header className="flex items-center px-6 py-3 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-foreground flex items-center justify-center flex-shrink-0">
            <span
              className="text-background text-xs font-bold"
              style={{ fontFamily: 'Figtree, sans-serif', letterSpacing: '0.05em', marginTop: '2.5px' }}
            >
              AF
            </span>
          </div>
          <span className="font-semibold tracking-tight text-sm">Airframe</span>
          <span className="text-muted-foreground text-sm">Receiver</span>
        </div>

        <div className="flex items-center gap-0.5 ml-4">
          {(['monitor', 'settings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'monitor' ? <Activity size={13} /> : <Settings size={13} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <StatusPill state={connState} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-5 overflow-hidden">
        {activeTab === 'monitor' ? (
          <MonitorTab
            conn={connState}
            networkIp={networkIp}
            remoteStream={remoteStream}
            metrics={metrics}
            bitrateHistory={bitrateHistory}
            onReconnect={reconnect}
          />
        ) : (
          <div className="h-full overflow-y-auto">
            <SettingsTab />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
