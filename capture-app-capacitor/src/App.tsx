import { useEffect, useRef, useState } from 'react';
import { Camera, Radio, Activity, Video, ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

function App() {
  const [status, setStatus] = useState<string>('Initializing Camera...');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(true);
  const [targetIp, setTargetIp] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    initCamera();
    return () => {
      cancelAnimationFrame(requestRef.current!);
      wsRef.current?.close();
      pcRef.current?.close();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      setStatus('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
      
      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraActive(true);
          setStatus('Scan the QR code on your PC');
          requestRef.current = requestAnimationFrame(scanQRCode);
        };
      }
    } catch (err) {
      console.error('Camera access failed', err);
      setStatus('Camera access denied or failed');
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data.startsWith('ws://')) {
          console.log("Found QR code", code.data);
          setScanning(false);
          setTargetIp(code.data);
          connectSignaling(code.data);
          return; // Stop scanning
        }
      }
    }
    if (scanning) {
      requestRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  const connectSignaling = (wsUrl: string) => {
    setStatus('Connecting to signaling server...');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setStatus('Connected to server. Initiating stream...');
      ws.send(JSON.stringify({ type: 'join', role: 'capture' }));
      // Instantly initiate WebRTC offer instead of waiting for receiver
      await initiateWebRTC();
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'capture') return; // Ignore our own messages

        if (data.type === 'answer') {
          setStatus('Answer received. Finalizing connection...');
          if (pcRef.current) {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.payload));
          }
        } else if (data.type === 'candidate') {
          if (pcRef.current && pcRef.current.remoteDescription) {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.payload));
          }
        }
      } catch (err) {
        console.error('Signaling message error', err);
      }
    };

    ws.onerror = () => {
      setStatus('WebSocket Error: Check console');
    };

    ws.onclose = () => {
      setStatus('Disconnected from server. Reconnecting...');
      setPeerConnected(false);
      // Wait and try reconnecting
      setTimeout(() => connectSignaling(wsUrl), 3000);
    };
  };

  const initiateWebRTC = async () => {
    if (!localStreamRef.current || !wsRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Add local camera/mic tracks to the connection
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'candidate',
          role: 'capture',
          payload: event.candidate
        }));
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeerConnected(true);
        setStatus('Streaming to Receiver (LIVE)');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setPeerConnected(false);
        setStatus('Connection to Receiver lost');
        setScanning(true); // Resume scanning if disconnected
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(scanQRCode);
      }
    };

    pcRef.current = pc;

    // Create Offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    wsRef.current.send(JSON.stringify({
      type: 'offer',
      role: 'capture',
      payload: pc.localDescription
    }));
  };

  return (
    <div className="w-screen h-screen bg-[#0A0A09] text-[#FAFAF9] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Camera Feed */}
      <video 
        ref={videoRef} 
        playsInline 
        muted 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full p-6 bg-black/30">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-auto">
          <div className="w-8 h-8 rounded-md bg-[#4D8AFF] flex items-center justify-center shadow-[0_0_15px_rgba(77,138,255,0.4)]">
            <Camera size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-medium tracking-tight shadow-black drop-shadow-md">Airframe <span className="text-[#FAFAF9]/70 font-normal">Capture</span></h1>
          
          {peerConnected && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-red-500/80 text-white rounded-full border border-red-500/30 animate-pulse backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-xs font-bold tracking-wider">LIVE</span>
            </div>
          )}
        </div>

        {/* Scanner Overlay UI */}
        {scanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-2 border-[#4D8AFF]/50 rounded-3xl relative">
              <div className="absolute -inset-1 border-2 border-white/20 rounded-3xl animate-pulse"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#4D8AFF] shadow-[0_0_8px_rgba(77,138,255,1)] animate-bounce"></div>
              <div className="absolute -bottom-16 left-0 right-0 text-center font-medium text-white shadow-black drop-shadow-md flex items-center justify-center gap-2">
                <ScanLine size={18} /> Point at QR Code
              </div>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl mt-auto transition-all">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${peerConnected ? 'bg-[#4D8AFF]/20 border-[#4D8AFF]/50' : 'bg-white/5 border-white/10'} border`}>
              {scanning ? <ScanLine size={28} className="text-[#FAFAF9]/50" /> : <Video size={28} className={peerConnected ? 'text-[#4D8AFF]' : 'text-[#FAFAF9]/50'} />}
              {peerConnected && <div className="absolute inset-0 rounded-full border border-[#4D8AFF]/50 animate-ping"></div>}
            </div>
          </div>
          
          <h2 className="text-xl font-medium mb-1 tracking-tight text-center">
            {scanning ? 'Pairing Mode' : (peerConnected ? 'Broadcasting Feed' : 'Connecting')}
          </h2>
          <p className="text-[#FAFAF9]/70 text-sm mb-6 text-center h-5">
            {status}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Activity size={16} className={peerConnected ? 'text-[#4D8AFF]' : 'text-[#FAFAF9]/40'} />
                <span className="text-sm font-medium">Link State</span>
              </div>
              <span className="text-sm text-[#FAFAF9]/80">{peerConnected ? 'Connected' : 'Idle'}</span>
            </div>
            {!scanning && targetIp && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Radio size={16} className="text-[#FAFAF9]/40" />
                  <span className="text-sm font-medium">Target IP</span>
                </div>
                <span className="text-sm text-[#FAFAF9]/80 font-mono text-xs">{targetIp}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
