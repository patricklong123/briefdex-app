import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

interface Props {
  color?: string;
  active?: boolean;
}

const BARS = [0, 120, 240, 360];

export function EqBars({ color = '#1a1407', active = true }: Props) {
  return (
    <View style={styles.row}>
      {BARS.map((delay, i) => (
        <EqBar key={i} color={color} delay={delay} active={active} />
      ))}
    </View>
  );
}

function EqBar({ color, delay, active }: { color: string; delay: number; active: boolean }) {
  const scale = useSharedValue(active ? 0.6 : 0.4);

  useEffect(() => {
    if (active) {
      scale.value = withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        ),
      );
    } else {
      scale.value = withTiming(0.4, { duration: 200 });
    }
  }, [active, delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: scale.value }] }));

  return (
    <Animated.View style={[styles.bar, { backgroundColor: color }, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 18,
  },
  bar: {
    width: 3,
    height: 18,
    borderRadius: 1.5,
    backgroundColor: colors.black,
  },
});
