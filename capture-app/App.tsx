import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';
import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import { ErrorBoundary } from './ErrorBoundary';
import { SplashScreen } from './screens/SplashScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { QRScannerScreen } from './screens/QRScannerScreen';

type Screen = 'splash' | 'discover' | 'preview' | 'settings' | 'qr';

function MainApp() {
  const cameraPerm = useCameraPermission();
  const micPerm = useMicrophonePermission();
  const device = useCameraDevice('back');

  const [screen, setScreen] = useState<Screen>('splash');
  const [targetIp, setTargetIp] = useState<string>('');
  const [peerConnected, setPeerConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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

  const connectSignaling = (wsUrl: string) => {
    // Clean up any existing connections before making a new one
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setConnectionError(null);

    ws.onopen = async () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'join', role: 'capture' }));
      await initiateWebRTC();
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.role === 'capture') return;

        if (data.type === 'answer' && pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.payload));
        } else if (data.type === 'candidate' && pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.payload));
        }
      } catch (err) {
        console.error('Signaling error', err);
      }
    };

    ws.onerror = () => {
      setConnectionError('Connection failed');
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setPeerConnected(false);
      setConnectionError('Disconnected');
    };
  };

  const initiateWebRTC = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;

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
          setScreen('preview');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setPeerConnected(false);
        }
      });

      const offer = await pc.createOffer({});

      // SDP hack for 20 Mbps limit
      let sdp = offer.sdp;
      if (sdp && sdp.includes("b=AS:")) {
        sdp = sdp.replace(/b=AS:\d+/g, "b=AS:20000");
      } else if (sdp) {
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
      setConnectionError('Failed to init WebRTC');
    }
  };

  const handleConnect = (ip: string) => {
    setTargetIp(ip);
    setConnectionError(null);
    // For now, simulate connection by parsing IP as ws:// URL
    // In production, this would convert to actual signaling server URL
    const wsUrl = ip.startsWith('ws://') ? ip : `ws://${ip}:4747`;
    connectSignaling(wsUrl);
  };

  const handleOpenQRScanner = () => {
    setScreen('qr');
  };

  const handleQRScanned = (url: string) => {
    setScreen('discover');
    handleConnect(url);
  };

  const handleOpenSettings = () => {
    setScreen('settings');
  };

  const handleBackFromSettings = () => {
    setScreen('preview');
  };

  // Permissions wait
  if (!cameraPerm.hasPermission || !micPerm.hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D8AFF" />
        <Text style={styles.loadingText}>Waiting for permissions...</Text>
      </View>
    );
  }

  // No camera
  if (device == null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No camera device found!</Text>
      </View>
    );
  }

  // Render screens
  if (screen === 'splash') {
    return <SplashScreen onReady={() => setScreen('discover')} />;
  }

  if (screen === 'discover') {
    return (
      <DiscoverScreen
        onConnect={handleConnect}
        onOpenSettings={handleOpenSettings}
        onOpenQRScanner={handleOpenQRScanner}
        connectionError={connectionError}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen onBack={handleBackFromSettings} />;
  }

  if (screen === 'qr') {
    return (
      <QRScannerScreen
        onScanned={handleQRScanned}
        onClose={() => setScreen('discover')}
      />
    );
  }

  // Preview screen with camera
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={screen === 'preview'}
      />
      <PreviewScreen onOpenSettings={handleOpenSettings} />
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
    backgroundColor: '#080808',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A09',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FAFAF9',
    marginTop: 10,
    fontSize: 14,
  },
});