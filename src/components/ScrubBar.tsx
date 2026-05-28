import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

interface Props {
  /** Current playback progress 0..1. Ignored visually while the user is dragging. */
  progress: number;
  /** Fires continuously while the user drags, with the new 0..1 ratio. */
  onScrub?: (ratio: number) => void;
  /** Fires once when the user releases — the only place audio should seek. */
  onScrubComplete?: (ratio: number) => void;
  /** Disable interaction (still renders as a static progress bar). */
  disabled?: boolean;
  height?: number;
  trackColor?: string;
  /** Primary fill color (defaults to brand gold). Thumb glow follows this color. */
  color?: string;
  /** Secondary fill color used as the gradient highlight + thumb fill. */
  colorLight?: string;
  style?: ViewStyle;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function ScrubBar({
  progress,
  onScrub,
  onScrubComplete,
  disabled = false,
  height = 4,
  trackColor = colors.line,
  color = colors.gold,
  colorLight = colors.goldLight,
  style,
}: Props) {
  // Pixel width of the track is kept both in React state (so the fixed-width
  // gradient can size itself) and in a shared value (so the gesture worklet can
  // convert a touch X into a 0..1 ratio on the UI thread).
  const [trackW, setTrackW] = useState(0);
  const trackWidth = useSharedValue(0);
  const dragRatio = useSharedValue(0);
  const dragging = useSharedValue(false);
  const externalProgress = useSharedValue(clamp01(progress));

  // Mirror the incoming progress prop into a shared value, but never while the
  // user is dragging (their finger owns the position then).
  useEffect(() => {
    if (!dragging.value) externalProgress.value = clamp01(progress);
  }, [progress, dragging, externalProgress]);

  const displayRatio = useDerivedValue(() =>
    dragging.value ? dragRatio.value : externalProgress.value,
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(0)
    .onBegin((e) => {
      dragging.value = true;
      const r = trackWidth.value > 0 ? clamp01(e.x / trackWidth.value) : 0;
      dragRatio.value = r;
      if (onScrub) runOnJS(onScrub)(r);
    })
    .onUpdate((e) => {
      const r = trackWidth.value > 0 ? clamp01(e.x / trackWidth.value) : 0;
      dragRatio.value = r;
      if (onScrub) runOnJS(onScrub)(r);
    })
    .onEnd((e) => {
      const r = trackWidth.value > 0 ? clamp01(e.x / trackWidth.value) : 0;
      dragRatio.value = r;
      // Hold the released position so the bar doesn't snap back to the stale
      // `progress` prop in the frame before the audio service reports the seek.
      externalProgress.value = r;
      if (onScrubComplete) runOnJS(onScrubComplete)(r);
    })
    .onFinalize(() => {
      dragging.value = false;
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: displayRatio.value * trackWidth.value,
  }));

  const thumbStyle = useAnimatedStyle(() => {
    const size = dragging.value ? 18 : Math.max(height + 5, 10);
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      marginLeft: -size / 2,
      top: (height - size) / 2,
      left: displayRatio.value * trackWidth.value,
      shadowOpacity: dragging.value ? 1 : 0.9,
      shadowRadius: dragging.value ? 10 : 6,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidth.value = w;
    setTrackW(w);
  };

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={handleLayout} style={[styles.hitArea, style]}>
        <View
          style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}
        >
          <Animated.View
            style={[styles.fillClip, { height, borderRadius: height / 2 }, fillStyle]}
          >
            <LinearGradient
              colors={[color, colorLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: trackW, height }}
            />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[styles.thumb, { backgroundColor: colorLight, shadowColor: color }, thumbStyle]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hitArea: {
    width: '100%',
    paddingVertical: 14,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  fillClip: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
