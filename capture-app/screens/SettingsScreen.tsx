import React, { useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface Props {
  onBack: () => void;
}

function SegmentButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.segmentBtn, selected && styles.segmentBtnActive]}
    >
      <Text style={[styles.segmentBtnText, selected && styles.segmentBtnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.toggleContainer, value && styles.toggleContainerOn]}
    >
      <View
        style={[
          styles.toggleThumb,
          { transform: [{ translateX: value ? 18 : 2 }] },
        ]}
      />
    </Pressable>
  );
}

function NetworkRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.networkRow}>
      <Text style={styles.networkKey}>{label}</Text>
      <Text style={styles.networkValue}>{value}</Text>
    </View>
  );
}

function CustomSlider({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
}: {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (val: number) => void;
}) {
  const sliderWidth = 280;
  const thumbRef = useRef(new Animated.Value(0)).current;

  const percent = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = percent * (sliderWidth - 20);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const rawX = gestureState.dx + (thumbPosition);
        const clampedX = Math.max(0, Math.min(sliderWidth - 20, rawX));
        const newValue = minimumValue + (clampedX / (sliderWidth - 20)) * (maximumValue - minimumValue);
        const stepped = Math.round(newValue / step) * step;
        onValueChange(stepped);
      },
    })
  ).current;

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderTrack}>
        <View
          style={[
            styles.sliderFill,
            { width: `${percent * 100}%` },
          ]}
        />
      </View>
      <Animated.View
        style={[styles.sliderThumb, { left: thumbPosition }]}
        {...panResponder.panHandlers}
      />
    </View>
  );
}

export function SettingsScreen({ onBack }: Props) {
  const [resolution, setResolution] = useState<'4K' | '1080p' | '720p'>('1080p');
  const [frameRate, setFrameRate] = useState<60 | 30 | 24>(60);
  const [bitrate, setBitrate] = useState(8);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(false);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.namespace}>AIRFRAME</Text>
        <Text style={styles.title}>Camera</Text>
      </View>

      {/* Resolution section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RESOLUTION</Text>
        <View style={styles.segmentRow}>
          <SegmentButton
            label="4K"
            selected={resolution === '4K'}
            onPress={() => setResolution('4K')}
          />
          <SegmentButton
            label="1080p"
            selected={resolution === '1080p'}
            onPress={() => setResolution('1080p')}
          />
          <SegmentButton
            label="720p"
            selected={resolution === '720p'}
            onPress={() => setResolution('720p')}
          />
        </View>
      </View>

      {/* Frame Rate section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>FRAME RATE</Text>
        <View style={styles.segmentRow}>
          <SegmentButton
            label="60 fps"
            selected={frameRate === 60}
            onPress={() => setFrameRate(60)}
          />
          <SegmentButton
            label="30 fps"
            selected={frameRate === 30}
            onPress={() => setFrameRate(30)}
          />
          <SegmentButton
            label="24 fps"
            selected={frameRate === 24}
            onPress={() => setFrameRate(24)}
          />
        </View>
      </View>

      {/* Bitrate section */}
      <View style={styles.section}>
        <View style={styles.bitrateHeader}>
          <Text style={styles.sectionLabel}>BITRATE</Text>
          <Text style={styles.bitrateValue}>{bitrate} Mbps</Text>
        </View>
        <CustomSlider
          minimumValue={2}
          maximumValue={20}
          step={1}
          value={bitrate}
          onValueChange={setBitrate}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>2 Mbps</Text>
          <Text style={styles.sliderLabel}>20 Mbps</Text>
        </View>
      </View>

      {/* Toggles section */}
      <View style={styles.section}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleLabel}>Include Audio</Text>
            <Text style={styles.toggleSublabel}>Stream device microphone</Text>
          </View>
          <Toggle value={includeAudio} onToggle={() => setIncludeAudio((a) => !a)} />
        </View>
        <View style={styles.divider} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextCol}>
            <Text style={styles.toggleLabel}>Auto-Reconnect</Text>
            <Text style={styles.toggleSublabel}>Retry on connection loss</Text>
          </View>
          <Toggle value={autoReconnect} onToggle={() => setAutoReconnect((r) => !r)} />
        </View>
      </View>

      {/* Network info table */}
      <View style={styles.networkTable}>
        <NetworkRow label="Port" value="4747" />
        <View style={styles.networkDivider} />
        <NetworkRow label="Timeout" value="10 s" />
        <View style={styles.networkDivider} />
        <NetworkRow label="Protocol" value="TCP / UDP" />
        <View style={styles.networkDivider} />
        <NetworkRow label="Auth" value="None" />
      </View>
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
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.30)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
  },
  segmentBtnText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.50)',
  },
  segmentBtnTextActive: {
    color: '#0A0A09',
  },
  bitrateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bitrateValue: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  sliderContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
  },
  sliderFill: {
    height: 3,
    backgroundColor: '#4D8AFF',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    top: 2,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sliderLabel: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  toggleSublabel: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  toggleContainer: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
  },
  toggleContainerOn: {
    backgroundColor: '#4D8AFF',
  },
  toggleThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    top: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  networkTable: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  networkKey: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
  },
  networkValue: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  networkDivider: {
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
});
