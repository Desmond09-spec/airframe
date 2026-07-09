import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface Props {
  onReady: () => void;
}

function PulsingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 0.65,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.25,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { opacity: anim }]}
    />
  );
}

export function SplashScreen({ onReady }: Props) {
  const pingScale = useRef(new Animated.Value(1)).current;
  const pingOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Outer ping ring animation
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pingScale, {
          toValue: 1.15,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pingOpacity, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    // Auto-navigate
    const timer = setTimeout(onReady, 2000);
    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.screen}>
      {/* Ring cluster */}
      <View style={styles.ringCluster}>
        {/* Outer ping ring */}
        <Animated.View
          style={[
            styles.outerRing,
            { transform: [{ scale: pingScale }], opacity: pingOpacity },
          ]}
        />
        {/* Inner static ring */}
        <View style={styles.innerRing} />
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>AF</Text>
        </View>
      </View>

      {/* Wordmark */}
      <View style={styles.wordmark}>
        <Text style={styles.appName}>Airframe</Text>
        <Text style={styles.version}>V2.4.0</Text>
      </View>

      {/* Pulsing dots */}
      <View style={styles.dots}>
        <PulsingDot delay={0} />
        <PulsingDot delay={250} />
        <PulsingDot delay={500} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A09',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCluster: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  outerRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.045)',
  },
  innerRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  logoText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 16,
    color: '#0A0A09',
  },
  wordmark: {
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  version: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.30)',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 56,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,1)',
  },
});
