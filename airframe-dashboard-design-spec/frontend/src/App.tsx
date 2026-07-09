import { useEffect, useRef, useState } from 'react';
import { GetNetworkIP } from '../wailsjs/go/main/App';
import Toolbar from './components/Toolbar';
import PreviewPane from './components/MonitorTab/PreviewPane';
import DeviceStrip from './components/MonitorTab/DeviceStrip';
import MetricsPanel from './components/MonitorTab/MetricsPanel';
import SettingsTab from './components/SettingsTab/SettingsTab';

const WS_URL = 'ws://127.0.0.1:4747';

type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

function App() {
  const [activeTab, setActiveTab] = useState<'monitor' | 'settings'>('monitor');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [networkIp, setNetworkIp] = useState<string>('');
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    latency: 24,
    fps: 59.9,
    bitrate: 8.4,
    packetLoss: 0.0,
    signalQuality: 94,
  });
  
  const [bitrateHistory, setBitrateHistory] = useState<{ t: number; v: number }[]>(
    Array.from({ length: 30 }, (_, i) => ({ t: i, v: 8.4 }))
  );

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    GetNetworkIP().then((ip) => {
      setNetworkIp(ip);
      connectSignaling();
    });
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, []);

  // Live data updates (1-second interval)
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const id = setInterval(() => {
      // Drift metrics within realistic bounds
      setMetrics((prev) => ({
        latency: clamp(prev.latency + drift(4), 10, 140),
        fps: clamp(prev.fps + drift(0.15), 55, 60.1),
        bitrate: clamp(prev.bitrate + drift(0.35), 6, 12),
        packetLoss: clamp(prev.packetLoss + drift(0.06), 0, 1.5),
        signalQuality: clamp(prev.signalQuality + drift(1.5), 82, 99),
      }));

      // Update bitrate chart
      setBitrateHistory((prev) => [
        ...prev.slice(1),
        { t: prev[prev.length - 1].t + 1, v: metrics.bitrate },
      ]);
    }, 1000);

    return () => clearInterval(id);
  }, [connectionState, metrics.bitrate]);

  // Real WebRTC stats polling when connected
  useEffect(() => {
    if (connectionState !== 'connected' || !pcRef.current) return;

    let previousBytesReceived = 0;
    let previousTimestamp = Date.now();

    const pollStats = async () => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        const statsReport = await pc.getStats();
        
        statsReport.forEach((stat) => {
          if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
            const bytesReceived = stat.bytesReceived || 0;
            const timestamp = stat.timestamp || Date.now();
            
            if (previousBytesReceived > 0 && previousTimestamp > 0) {
              const timeDiff = (timestamp - previousTimestamp) / 1000;
              const bytesDiff = bytesReceived - previousBytesReceived;
              const bitsPerSecond = (bytesDiff * 8) / timeDiff;
              const mbps = bitsPerSecond / 1000000;
              
              setMetrics((prev) => ({ ...prev, bitrate: mbps }));
            }
            
            previousBytesReceived = bytesReceived;
            previousTimestamp = timestamp;

            if (stat.frameWidth && stat.frameHeight) {
              // Resolution available if needed
            }
          }

          if (stat.type === 'remote-inbound-rtp' && stat.mediaType === 'video') {
            const rtt = stat.roundTripTime;
            if (rtt) {
              setMetrics((prev) => ({ ...prev, latency: rtt * 1000 }));
            }
          }
        });
      } catch (err) {
        console.error('Failed to get WebRTC stats:', err);
      }
    };

    const interval = setInterval(pollStats, 1000);
    return () => clearInterval(interval);
  }, [connectionState]);

  const connectSignaling = () => {
    setConnectionState('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', role: 'receiver' }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'receiver') return;

        if (data.type === 'offer') {
          await handleOffer(data.payload);
        } else if (data.type === 'candidate') {
          await handleCandidate(data.payload);
        } else if (data.type === 'join' && data.role === 'capture') {
          setConnectionState('connecting');
        }
      } catch (err) {
        console.error('Failed to parse signaling message', err);
      }
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      setTimeout(connectSignaling, 3000);
    };
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'candidate',
          role: 'receiver',
          payload: event.candidate
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnectionState('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionState('error');
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const pc = pcRef.current || createPeerConnection();
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        role: 'receiver',
        payload: pc.localDescription
      }));
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidateInit) => {
    if (pcRef.current && pcRef.current.remoteDescription) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const handleReconnect = () => {
    setConnectionState('connecting');
    connectSignaling();
  };

  const handleConnectionStateChange = (state: ConnectionState) => {
    setConnectionState(state);
    if (state === 'connected') {
      // Demo mode: simulate connection
    } else if (state === 'disconnected') {
      pcRef.current?.close();
      pcRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ fontFamily: 'Figtree, system-ui, sans-serif' }}>
      <Toolbar 
        connectionState={connectionState} 
        onConnectionStateChange={handleConnectionStateChange}
      />

      <div className="flex-1 p-5">
        {activeTab === 'monitor' ? (
          <div className="flex gap-4 h-full">
            {/* Left column — preview + device strip */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              <PreviewPane
                connectionState={connectionState}
                fps={metrics.fps}
                bitrate={metrics.bitrate}
                onReconnect={handleReconnect}
              />
              <DeviceStrip onReconnect={handleReconnect} />
            </div>

            {/* Right column — metrics panel */}
            <MetricsPanel
              latency={metrics.latency}
              fps={metrics.fps}
              bitrate={metrics.bitrate}
              packetLoss={metrics.packetLoss}
              signalQuality={metrics.signalQuality}
              bitrateHistory={bitrateHistory}
            />
          </div>
        ) : (
          <SettingsTab />
        )}
      </div>
    </div>
  );
}

// Helper functions for demo data drift
function drift(magnitude: number): number {
  return (Math.random() - 0.5) * magnitude;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default App;
