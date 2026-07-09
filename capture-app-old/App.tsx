import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission, useCodeScanner } from 'react-native-vision-camera';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import { ErrorBoundary } from './ErrorBoundary';

function MainApp() {
  const cameraPerm = useCameraPermission();
  const micPerm = useMicrophonePermission();
  const device = useCameraDevice('back');
  
  const [status, setStatus] = useState<string>('Requesting access...');
  const [scanning, setScanning] = useState<boolean>(true);
  const [targetIp, setTargetIp] = useState<string>('');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Request Permissions on Mount
  useEffect(() => {
    if (!cameraPerm.hasPermission) {
      cameraPerm.requestPermission();
    }
    if (!micPerm.hasPermission) {
      micPerm.requestPermission();
    }
  }, [cameraPerm, micPerm]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: (codes) => {
      if (!scanning) return;
      for (const code of codes) {
        const value = code.value;
        if (value && value.startsWith('ws://')) {
          console.log(`Found QR code: ${value}`);
          setScanning(false);
          setTargetIp(value);
          setStatus('Connecting to signaling server...');
          connectSignaling(value);
          return;
        }
      }
    }
  });

  const connectSignaling = (wsUrl: string) => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = async () => {
      setStatus('Connected. Initiating stream...');
      ws.send(JSON.stringify({ type: 'join', role: 'capture' }));
      await initiateWebRTC();
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'capture') return;

        if (data.type === 'answer' && pcRef.current) {
          setStatus('Finalizing connection...');
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.payload));
        } else if (data.type === 'candidate' && pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.payload));
        }
      } catch (err) {
        console.error('Signaling error', err);
      }
    };

    ws.onclose = () => {
      setStatus('Disconnected. Reconnecting...');
      setPeerConnected(false);
      setTimeout(() => connectSignaling(wsUrl), 3000);
    };
  };

  const initiateWebRTC = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

      // Request stream from react-native-webrtc to pipe to peer connection
      // Note: Vision Camera renders locally, WebRTC stream is just for transport
      const stream = await mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
          facingMode: "environment"
        },
        audio: true
      });

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // @ts-ignore: react-native-webrtc types don't properly expose addEventListener
      pc.addEventListener('icecandidate', (event: any) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            role: 'capture',
            payload: event.candidate
          }));
        }
      });

      // @ts-ignore: react-native-webrtc types don't properly expose addEventListener
      pc.addEventListener('connectionstatechange', () => {
        if (pc.connectionState === 'connected') {
          setPeerConnected(true);
          setStatus('Streaming to Receiver (LIVE)');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setPeerConnected(false);
          setStatus('Connection lost');
          setScanning(true);
        }
      });

      const offer = await pc.createOffer({});
      
      // THE SDP HACK: Force 20 Mbps limit bypass for pristine 1080p WebRTC
      let sdp = offer.sdp;
      if (sdp.includes("b=AS:")) {
        sdp = sdp.replace(/b=AS:\d+/g, "b=AS:20000");
      } else {
        sdp = sdp.replace(/c=IN IP4 .*\r\n/g, "$&b=AS:20000\r\n");
      }
      offer.sdp = sdp;

      await pc.setLocalDescription(offer);

      wsRef.current?.send(JSON.stringify({
        type: 'offer',
        role: 'capture',
        payload: pc.localDescription
      }));
    } catch (err) {
      console.error('WebRTC Init Error', err);
      setStatus('Failed to init WebRTC');
    }
  };

  if (!cameraPerm.hasPermission || !micPerm.hasPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4D8AFF" />
        <Text style={styles.text}>Waiting for permissions...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No camera device found!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={scanning ? codeScanner : undefined}
      />

      {/* UI Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>📷</Text>
          </View>
          <Text style={styles.title}>Airframe <Text style={styles.titleLight}>Capture</Text></Text>
          
          {peerConnected && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>

        {/* Scanner Overlay UI */}
        {scanning && (
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerBox}>
              <View style={styles.scannerLine} />
              <Text style={styles.scannerText}>Point at QR Code</Text>
            </View>
          </View>
        )}

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Text style={styles.statusIconLarge}>{scanning ? '🔍' : (peerConnected ? '🎥' : '🔄')}</Text>
          </View>
          
          <Text style={styles.statusTitle}>
            {scanning ? 'Pairing Mode' : (peerConnected ? 'Broadcasting Feed' : 'Connecting')}
          </Text>
          <Text style={styles.statusSubtitle}>{status}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Link State</Text>
            <Text style={styles.infoValue}>{peerConnected ? 'Connected' : 'Idle'}</Text>
          </View>

          {!scanning && targetIp ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Target IP</Text>
              <Text style={styles.infoValue}>{targetIp}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A09',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FAFAF9',
    marginTop: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  iconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#4D8AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  titleLight: {
    fontWeight: '400',
    color: 'rgba(250,250,249,0.7)',
  },
  liveBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  scannerBox: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderColor: 'rgba(77,138,255,0.5)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerLine: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#4D8AFF',
  },
  scannerText: {
    position: 'absolute',
    bottom: -40,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIconLarge: {
    fontSize: 32,
  },
  statusTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: 'rgba(250,250,249,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    color: 'rgba(250,250,249,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    color: 'rgba(250,250,249,0.8)',
    fontSize: 14,
  }
});
