import { useEffect, useRef, useState } from 'react';
import { Radio, Server, Activity, MonitorPlay } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { GetNetworkIP } from '../wailsjs/go/main/App';

const WS_URL = 'ws://127.0.0.1:4747';

function App() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);
  const [networkIp, setNetworkIp] = useState<string>('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [stats, setStats] = useState<{ latency: string; bitrate: string; resolution: string; obsStatus: string }>({
    latency: '--',
    bitrate: '--',
    resolution: '--',
    obsStatus: 'Disconnected'
  });

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

  // Poll WebRTC stats every second when peer is connected
  useEffect(() => {
    if (!peerConnected || !pcRef.current) return;

    let previousBytesReceived = 0;
    let previousTimestamp = Date.now();

    const pollStats = async () => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        const statsReport = await pc.getStats();
        let currentLatency = '--';
        let currentBitrate = '--';
        let currentResolution = '--';

        statsReport.forEach((stat) => {
          // Calculate bitrate from inbound-rtp video stats
          if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
            const bytesReceived = stat.bytesReceived || 0;
            const timestamp = stat.timestamp || Date.now();
            
            if (previousBytesReceived > 0 && previousTimestamp > 0) {
              const timeDiff = (timestamp - previousTimestamp) / 1000; // seconds
              const bytesDiff = bytesReceived - previousBytesReceived;
              const bitsPerSecond = (bytesDiff * 8) / timeDiff;
              const mbps = bitsPerSecond / 1000000;
              currentBitrate = mbps.toFixed(1) + ' Mbps';
            }
            
            previousBytesReceived = bytesReceived;
            previousTimestamp = timestamp;

            // Get resolution from frame dimensions
            if (stat.frameWidth && stat.frameHeight) {
              currentResolution = `${stat.frameWidth} x ${stat.frameHeight}`;
            }
          }

          // Estimate latency from round-trip time
          if (stat.type === 'remote-inbound-rtp' && stat.mediaType === 'video') {
            const rtt = stat.roundTripTime;
            if (rtt) {
              currentLatency = Math.round(rtt * 1000) + 'ms';
            }
          }
        });

        setStats({
          latency: currentLatency,
          bitrate: currentBitrate,
          resolution: currentResolution,
          obsStatus: 'Connected'
        });
      } catch (err) {
        console.error('Failed to get WebRTC stats:', err);
      }
    };

    pollStats(); // Initial poll
    const interval = setInterval(pollStats, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [peerConnected]);

  const connectSignaling = () => {
    setStatus('Connecting to local server...');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('Waiting for Capture App...');
      // Announce ourselves as receiver
      ws.send(JSON.stringify({ type: 'join', role: 'receiver' }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'receiver') return; // Ignore messages from other receivers

        if (data.type === 'offer') {
          setStatus('Offer received, connecting...');
          await handleOffer(data.payload);
        } else if (data.type === 'candidate') {
          await handleCandidate(data.payload);
        } else if (data.type === 'join' && data.role === 'capture') {
          setStatus('Capture App discovered. Ready.');
        }
      } catch (err) {
        console.error('Failed to parse signaling message', err);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected from server. Reconnecting...');
      setPeerConnected(false);
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
        setPeerConnected(true);
        setStatus('Connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setPeerConnected(false);
        setStatus('Connection lost');
      }
    };

    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
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

  // Waiting/Setup UI (Window Capture full-screen block removed per migration plan)
  return (
    <div className="app">
      <div className="app__header">
        <div className="app__logo">
          <MonitorPlay size={18} className="app__logo-icon" />
        </div>
        <h1 className="app__title">AIRFRAME</h1>
        {peerConnected && (
          <div className="app__live-indicator">
            <div className="app__live-dot"></div>
            <span className="app__live-text">LIVE</span>
          </div>
        )}
      </div>

      <div className="app__card">
        {networkIp ? (
          <QRCodeSVG value={`ws://${networkIp}:4747`} size={200} level="M" />
        ) : (
          <div className="app__loading-spinner">
            <Server size={32} className="app__server-icon" />
            <div className="app__loading-ring"></div>
          </div>
        )}

        <h2 className="app__card-title">Waiting for Signal</h2>
        <p className="app__card-description">
          {networkIp
            ? "Scan this QR code with the Airframe Capture app to connect."
            : "Starting local server..."}
        </p>

        <div className="app__status-rows">
          <div className="app__status-row">
            <div className="app__status-label">
              <Activity size={16} className="app__icon" />
              <span className="app__status-label-text">Status</span>
            </div>
            <span className="app__status-value">{status}</span>
          </div>
          <div className="app__status-row">
            <div className="app__status-label">
              <Radio size={16} className="app__icon" />
              <span className="app__status-label-text">Network</span>
            </div>
            <span className="app__status-value">{networkIp || 'Discovering...'}</span>
          </div>
        </div>
      </div>

      {/* Stats display (shows when connected) */}
      {peerConnected && (
        <div className="app__stats">
          <div className="app__stat">
            <span className="app__stat-label">Latency</span>
            <span className="app__stat-value">{stats.latency}</span>
          </div>
          <div className="app__stat">
            <span className="app__stat-label">Bitrate</span>
            <span className="app__stat-value">{stats.bitrate}</span>
          </div>
          <div className="app__stat">
            <span className="app__stat-label">Resolution</span>
            <span className="app__stat-value">{stats.resolution}</span>
          </div>
          <div className="app__stat">
            <span className="app__stat-label">OBS Plugin</span>
            <span className="app__stat-value">{stats.obsStatus}</span>
          </div>
        </div>
      )}

      {/* Monitoring thumbnail (shows when connected) */}
      {peerConnected && remoteStream && (
        <div className="app__monitoring">
          <video
            ref={(el) => {
              if (el && remoteStream && el.srcObject !== remoteStream) {
                el.srcObject = remoteStream;
              }
            }}
            autoPlay
            playsInline
            muted
            className="app__monitoring-video"
          />
          <div className="app__monitoring-badge">
            Monitoring
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
