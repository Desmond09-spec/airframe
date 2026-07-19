import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import type { CodeType } from 'react-native-vision-camera';
import { X } from 'lucide-react-native';

const XIcon = X as React.ComponentType<any>;

interface Props {
  onScanned: (url: string) => void;
  onClose: () => void;
}

export function QRScannerScreen({ onScanned, onClose }: Props) {
  const device = useCameraDevice('back');
  const cameraPerm = useCameraPermission();
  const [error, setError] = useState<string | null>(null);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr' as CodeType],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value;
      if (!value) return;
      if (!value.startsWith('ws://') && !value.startsWith('http://')) {
        setError('Not an Airframe QR code');
        return;
      }
      onScanned(value);
    },
  });

  if (!cameraPerm.hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <XIcon size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Camera permission required</Text>
        </View>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}>
            <XIcon size={24} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>No camera device found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Scan window */}
      <View style={styles.scanWindowContainer}>
        <View style={styles.scanWindow}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.hintText}>
          {error ?? 'Point at the QR code on the desktop'}
        </Text>
      </View>

      {/* Close button */}
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <XIcon size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const SCAN_SIZE = 240;
const CORNER_LEN = 28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A09',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  header: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  scanWindowContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
  },
  corner: {
    position: 'absolute',
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: '#4D8AFF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  hintText: {
    marginTop: 24,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.60)',
    textAlign: 'center',
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.50)',
  },
});
