import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Circle, FlipHorizontal2 as FlipHorizontal, Mic, MicOff, Settings, Square, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Suppress lucide-react-native type issues - color prop works at runtime
const ZapIcon = Zap as React.ComponentType<any>;
const MicIcon = Mic as React.ComponentType<any>;
const MicOffIcon = MicOff as React.ComponentType<any>;
const FlipHorizontalIcon = FlipHorizontal as React.ComponentType<any>;
const CircleIcon = Circle as React.ComponentType<any>;
const SquareIcon = Square as React.ComponentType<any>;
const SettingsIcon = Settings as React.ComponentType<any>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  onOpenSettings: () => void;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function CornerBracket({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: any = {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: 'rgba(255,255,255,0.25)',
  };

  if (position === 'tl') {
    style.top = 20;
    style.left = 16;
    style.borderTopWidth = 1;
    style.borderLeftWidth = 1;
  } else if (position === 'tr') {
    style.top = 20;
    style.right = 16;
    style.borderTopWidth = 1;
    style.borderRightWidth = 1;
  } else if (position === 'bl') {
    style.bottom = 72;
    style.left = 16;
    style.borderBottomWidth = 1;
    style.borderLeftWidth = 1;
  } else {
    style.bottom = 72;
    style.right = 16;
    style.borderBottomWidth = 1;
    style.borderRightWidth = 1;
  }

  return <View style={style} />;
}

function IntersectionMark({ x, y }: { x: number; y: number }) {
  return (
    <View
      style={[
        styles.intersectionMark,
        {
          left: `${x}%`,
          top: `${y}%`,
          transform: [{ translateX: -6 }, { translateY: -6 }],
        },
      ]}
    />
  );
}

function IntersectionMarkInner() {
  return (
    <View style={styles.intersectionInner}>
      <View style={[styles.intersectionBar, { top: 0, left: 4, right: 4, height: 1 }]} />
      <View style={[styles.intersectionBar, { bottom: 0, left: 4, right: 4, height: 1 }]} />
      <View style={[styles.intersectionBar, { left: 0, top: 4, bottom: 4, width: 1 }]} />
      <View style={[styles.intersectionBar, { right: 0, top: 4, bottom: 4, width: 1 }]} />
    </View>
  );
}

export function PreviewScreen({ onOpenSettings }: Props) {
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const liveDotAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLive) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isLive]);

  useEffect(() => {
    if (!isLive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(liveDotAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLive]);

  return (
    <View style={styles.screen}>
      {/* Layer 1: Viewfinder grid */}
      <View style={styles.gridContainer}>
        <View style={[styles.gridLineH, { top: '33.33%' }]} />
        <View style={[styles.gridLineH, { top: '66.67%' }]} />
        <View style={[styles.gridLineV, { left: '33.33%' }]} />
        <View style={[styles.gridLineV, { left: '66.67%' }]} />
      </View>

      {/* Layer 2: Intersection marks */}
      <IntersectionMark x={33.33} y={33.33} />
      <IntersectionMark x={66.67} y={33.33} />
      <IntersectionMark x={33.33} y={66.67} />
      <IntersectionMark x={66.67} y={66.67} />

      {/* Layer 3: Corner brackets */}
      <CornerBracket position="tl" />
      <CornerBracket position="tr" />
      <CornerBracket position="bl" />
      <CornerBracket position="br" />

      {/* Layer 4: Focus reticle */}
      <View style={styles.focusReticleOuter}>
        <View style={styles.focusReticleInner} />
      </View>

      {/* Layer 5: Exposure gauge */}
      <View style={styles.exposureGauge}>
        <ZapIcon size={9} color="rgba(255,255,255,0.55)" />
        <View style={styles.exposureLine}>
          <View style={styles.exposureMarker} />
        </View>
      </View>

      {/* Layer 6: Top HUD */}
      <View style={styles.topHud}>
        {/* Tally pill */}
        {isLive ? (
          <View style={styles.tallyLive}>
            <Animated.View style={[styles.tallyDot, { opacity: liveDotAnim }]} />
            <Text style={styles.tallyLiveText}>LIVE</Text>
          </View>
        ) : (
          <View style={styles.tallyStandby}>
            <View style={[styles.tallyDot, { backgroundColor: 'rgba(255,255,255,0.40)' }]} />
            <Text style={styles.tallyStandbyText}>STANDBY</Text>
          </View>
        )}

        {/* Right HUD group */}
        <View style={styles.topRightGroup}>
          <View style={styles.resolutionBadge}>
            <Text style={styles.resolutionText}>1080 · 60 fps</Text>
          </View>
          <Pressable
            onPress={() => setIsMuted((m) => !m)}
            style={styles.micButton}
          >
            {isMuted ? (
              <MicOffIcon size={12} color="#F87171" />
            ) : (
              <MicIcon size={12} color="rgba(255,255,255,0.55)" />
            )}
          </Pressable>
        </View>
      </View>

      {/* Layer 7: Bottom controls */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)']}
        style={styles.bottomGradient}
      >
        <View style={styles.controlsRow}>
          {/* Flip button */}
          <Pressable style={styles.controlBtn}>
            <FlipHorizontalIcon size={15} color="rgba(255,255,255,0.75)" />
          </Pressable>

          {/* Record button */}
          <Pressable
            onPress={() => setIsLive((l) => !l)}
            style={[
              styles.recordBtn,
              isLive && styles.recordBtnLive,
            ]}
          >
            {isLive ? (
              <SquareIcon size={20} color="#F87171" fill="#F87171" />
            ) : (
              <CircleIcon size={24} color="rgba(255,255,255,0.80)" fill="rgba(255,255,255,0.80)" />
            )}
          </Pressable>

          {/* Settings button */}
          <Pressable onPress={onOpenSettings} style={styles.controlBtn}>
            <SettingsIcon size={15} color="rgba(255,255,255,0.75)" />
          </Pressable>
        </View>

        {/* Elapsed timer */}
        {isLive && (
          <Text style={styles.elapsedTimer}>
            {formatElapsed(elapsed)} · 8.4 Mbps
          </Text>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#080808',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.032)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.032)',
  },
  intersectionMark: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  intersectionInner: {
    flex: 1,
  },
  intersectionBar: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  focusReticleOuter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    transform: [{ translateX: -34 }, { translateY: -34 }],
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  focusReticleInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
  exposureGauge: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -60 }],
    alignItems: 'center',
    gap: 4,
    opacity: 0.35,
  },
  exposureLine: {
    width: 1,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  exposureMarker: {
    position: 'absolute',
    top: 26,
    left: -5,
    width: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.60)',
  },
  topHud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  tallyStandby: {
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tallyLive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.30,
    shadowRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tallyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  tallyStandbyText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.60)',
  },
  tallyLiveText: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resolutionBadge: {
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  resolutionText: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  micButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.50)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 64,
    zIndex: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.30)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnLive: {
    borderColor: 'rgba(248,113,113,0.80)',
    backgroundColor: 'rgba(239,68,68,0.20)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.20,
    shadowRadius: 12,
  },
  elapsedTimer: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'DMMono_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.40)',
    fontVariant: ['tabular-nums'],
  },
});
