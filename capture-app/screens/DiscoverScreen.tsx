import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { ChevronDown, ChevronRight, Globe, Monitor, QrCode, Settings, TriangleAlert, Wifi } from 'lucide-react-native';

// Suppress lucide-react-native type issues - color prop works at runtime
const MonitorIcon = Monitor as React.ComponentType<any>;
const ChevronRightIcon = ChevronRight as React.ComponentType<any>;
const WifiIcon = Wifi as React.ComponentType<any>;
const GlobeIcon = Globe as React.ComponentType<any>;
const ChevronDownIcon = ChevronDown as React.ComponentType<any>;
const TriangleAlertIcon = TriangleAlert as React.ComponentType<any>;
const SettingsIcon = Settings as React.ComponentType<any>;
const QrCodeIcon = QrCode as React.ComponentType<any>;
import { LinearGradient } from 'expo-linear-gradient';
import { useServiceDiscovery } from '../hooks/useServiceDiscovery';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Device {
  id: string;
  name: string;
  ip: string;
  signal: number; // 0-100
}

interface Props {
  onConnect: (ip: string) => void;
  onOpenSettings: () => void;
  onOpenQRScanner: () => void;
  connectionError: string | null;
}

const BAR_HEIGHTS = [14 * 0.35, 14 * 0.55, 14 * 0.75, 14 * 1.0];
const BAR_THRESHOLDS = [26, 52, 78, 101]; // bar 4 virtually never lights

function SignalBars({ signal }: { signal: number }) {
  return (
    <View style={styles.barsContainer}>
      {BAR_HEIGHTS.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            { height: h, backgroundColor: signal > BAR_THRESHOLDS[i] ? '#34C759' : 'rgba(255,255,255,0.12)' },
          ]}
        />
      ))}
    </View>
  );
}

function DeviceRow({ device, onPress }: { device: Device; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.deviceRow}>
      <View style={styles.deviceIcon}>
        <MonitorIcon size={15} color="rgba(255,255,255,0.50)" />
      </View>
      <View style={styles.deviceText}>
        <Text style={styles.deviceName} numberOfLines={1}>{device.name}</Text>
        <Text style={styles.deviceIp}>{device.ip}</Text>
      </View>
      <View style={styles.deviceRight}>
        <SignalBars signal={device.signal} />
        <ChevronRightIcon size={13} color="rgba(255,255,255,0.25)" />
      </View>
    </Pressable>
  );
}

export function DiscoverScreen({ onConnect, onOpenSettings, onOpenQRScanner, connectionError }: Props) {
  const { services, scanning } = useServiceDiscovery();
  const [manual, setManual] = useState(false);
  const [manualIp, setManualIp] = useState('');
  const chevronAnim = useRef(new Animated.Value(0)).current;
  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pingScale, {
          toValue: 1.6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pingOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  function toggleManual() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setManual((v) => !v);
    Animated.timing(chevronAnim, {
      toValue: manual ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.namespace}>AIRFRAME</Text>
          <Pressable onPress={onOpenSettings} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <SettingsIcon size={20} color="rgba(255,255,255,0.50)" />
          </Pressable>
        </View>
        <Text style={styles.title}>Find Receiver</Text>
        <Text style={styles.subtitle}>Scanning local network</Text>
      </View>

      {/* Scan pulse row */}
      <View style={styles.scanRow}>
        <View style={styles.pingContainer}>
          <Animated.View
            style={[
              styles.pingRing,
              { transform: [{ scale: pingScale }], opacity: pingOpacity },
            ]}
          />
          <View style={styles.pingInner}>
            <WifiIcon size={13} color="#4D8AFF" />
          </View>
        </View>
        <LinearGradient
          colors={['rgba(77,138,255,0.35)', 'rgba(77,138,255,0.10)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientLine}
        />
        <Text style={styles.channelLabel}>5 GHz · ch.36</Text>
      </View>

      {/* Section label */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>DISCOVERED</Text>
        {scanning && <Text style={styles.scanningLabel}>Scanning…</Text>}
      </View>

      {/* Device list */}
      <View style={styles.deviceList}>
        {services.length === 0 && scanning && (
          <View style={styles.scanningRow}>
            <Text style={styles.scanningText}>Looking for Airframe receivers…</Text>
          </View>
        )}

        {services.map((s) => (
          <DeviceRow
            key={s.id}
            device={{ id: s.id, name: s.name, ip: s.host, signal: 90 }}
            onPress={() => onConnect(s.host)}
          />
        ))}

        {services.length === 0 && !scanning && (
          <View style={styles.scanningRow}>
            <Text style={styles.scanningText}>No receivers found on this network</Text>
          </View>
        )}

        {/* Manual IP row */}
        <Pressable onPress={toggleManual} style={styles.manualRow}>
          <GlobeIcon size={14} color="rgba(255,255,255,0.35)" style={{ flexShrink: 0 }} />
          <Text style={styles.manualLabel}>Enter IP manually</Text>
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <ChevronDownIcon size={13} color="rgba(255,255,255,0.25)" />
          </Animated.View>
        </Pressable>

        {manual && (
          <View style={styles.manualPanel}>
            <TextInput
              value={manualIp}
              onChangeText={setManualIp}
              placeholder="192.168.1.xxx"
              placeholderTextColor="rgba(255,255,255,0.20)"
              autoCapitalize="none"
              keyboardType="numeric"
              style={styles.manualInput}
            />
            <Pressable
              onPress={() => manualIp.trim() && onConnect(manualIp.trim())}
              style={styles.connectBtn}
            >
              <Text style={styles.connectBtnText}>Connect</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* QR scan button */}
      <Pressable onPress={onOpenQRScanner} style={styles.qrButton}>
        <QrCodeIcon size={18} color="#4D8AFF" />
        <Text style={styles.qrButtonText}>Scan QR Code</Text>
      </Pressable>

      {/* Error banner */}
      {connectionError && (
        <View style={styles.errorBanner}>
          <TriangleAlertIcon size={14} color="#F87171" style={{ alignSelf: 'flex-start', marginTop: 2 }} />
          <View>
            <Text style={styles.errorTitle}>Connection refused</Text>
            <Text style={styles.errorDetail}>{connectionError}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A09',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  namespace: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  pingContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(77,138,255,0.25)',
  },
  pingInner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(77,138,255,0.50)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientLine: {
    flex: 1,
    height: 1,
  },
  channelLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scanningLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(77,138,255,0.60)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  scanningRow: {
    padding: 20,
    alignItems: 'center',
  },
  scanningText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.30)',
    textAlign: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(77,138,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(77,138,255,0.20)',
    marginTop: 16,
  },
  qrButtonText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#4D8AFF',
  },
  sectionLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  deviceList: {
    gap: 8,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deviceText: {
    flex: 1,
    minWidth: 0,
  },
  deviceName: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  deviceIp: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  deviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 14,
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.13)',
  },
  manualLabel: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
    flex: 1,
  },
  manualPanel: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    gap: 12,
  },
  manualInput: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'DMMono_400Regular',
  },
  connectBtn: {
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#4D8AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    marginTop: 12,
  },
  errorTitle: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 12,
    color: '#FC8181',
  },
  errorDetail: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: 'rgba(239,68,68,0.60)',
    marginTop: 2,
  },
});