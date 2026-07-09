import { useEffect, useRef, useState } from 'react';
import { Radio, Server, Activity, MonitorPlay } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const LOCAL_HTTP_URL = 'http://127.0.0.1:4747';
const WS_URL = 'ws://127.0.0.1:4747';

function App() {
  const [status, setStatus] = useState<string>('Disconnected');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);
  const [networkIp, setNetworkIp] = useState<string>('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchNetworkIp().then(() => connectSignaling());
    return () => {
      wsRef.current?.close();
      pcRef.current?.close();
    };
  }, []);

  const fetchNetworkIp = async () => {
    try {
      const res = await fetch(LOCAL_HTTP_URL);
      const data = await res.json();
      if (data.networkIp) setNetworkIp(data.networkIp);
    } catch (err) {
      console.error('Failed to fetch network IP', err);
    }
  };

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

  // If connected, render ONLY the video (full screen) for OBS Window Capture
  if (peerConnected) {
    return (
      <div className="w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
        <video 
          ref={(el) => {
            if (el && remoteStream && el.srcObject !== remoteStream) {
              el.srcObject = remoteStream;
            }
          }} 
          autoPlay 
          playsInline 
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Waiting/Setup UI
  return (
    <div className="w-screen h-screen bg-[#0A0A09] text-[#FAFAF9] flex flex-col items-center justify-center font-sans">
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-[#4D8AFF] flex items-center justify-center shadow-[0_0_15px_rgba(77,138,255,0.4)]">
          <MonitorPlay size={18} className="text-white" />
        </div>
        <h1 className="text-xl font-medium tracking-tight">Airframe <span className="text-[#FAFAF9]/50 font-normal">Receiver</span></h1>
      </div>

      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl flex flex-col items-center text-center">
        {networkIp ? (
          <div className="bg-white p-4 rounded-xl mb-6 shadow-lg">
            <QRCodeSVG value={`ws://${networkIp}:4747`} size={180} level="M" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
            <Server size={32} className="text-[#4D8AFF]" />
            <div className="absolute inset-0 rounded-full border border-[#4D8AFF]/30 animate-ping"></div>
          </div>
        )}
        
        <h2 className="text-2xl font-medium mb-2 tracking-tight">Waiting for Signal</h2>
        <p className="text-[#FAFAF9]/60 text-sm mb-8 leading-relaxed">
          {networkIp 
            ? "Scan this QR code with the Airframe Capture app to connect." 
            : "Starting local server..."}
        </p>

        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-[#4D8AFF]" />
              <span className="text-sm font-medium">Status</span>
            </div>
            <span className="text-sm text-[#FAFAF9]/80">{status}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
            <div className="flex items-center gap-3">
              <Radio size={16} className="text-[#4D8AFF]" />
              <span className="text-sm font-medium">Network</span>
            </div>
            <span className="text-sm text-[#FAFAF9]/80 font-mono">{networkIp || 'Discovering...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
