import React, { useEffect, useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../theme/tokens';

interface Props {
  /** Current playback progress 0..1. */
  progress: number;
  /** Fires continuously while the user drags, with the new 0..1 ratio. */
  onScrub?: (ratio: number) => void;
  /** Fires once when the user releases — the only place audio should seek. */
  onScrubComplete?: (ratio: number) => void;
  /** Disable interaction (still renders as a static progress bar). */
  disabled?: boolean;
  /** Kept for call-site compatibility; the native slider sizes its own track. */
  height?: number;
  trackColor?: string;
  /** Primary fill color (the played portion). */
  color?: string;
  /** Thumb fill color. */
  colorLight?: string;
  style?: ViewStyle;
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Native scrub bar backed by @react-native-community/slider. Replaces the old
 * gesture-handler + reanimated implementation, which could trigger a native
 * SIGABRT on touch. Seek happens only on release (onSlidingComplete).
 */
export function ScrubBar({
  progress,
  onScrub,
  onScrubComplete,
  disabled = false,
  trackColor = colors.line,
  color = colors.gold,
  colorLight = colors.goldLight,
  style,
}: Props) {
  // Freeze the slider value while dragging so periodic playback progress updates
  // don't yank the thumb away from the user's finger.
  const [sliding, setSliding] = useState(false);
  const [value, setValue] = useState(clamp01(progress));

  useEffect(() => {
    if (!sliding) setValue(clamp01(progress));
  }, [progress, sliding]);

  return (
    <Slider
      style={[styles.slider, style]}
      minimumValue={0}
      maximumValue={1}
      value={value}
      disabled={disabled}
      minimumTrackTintColor={color}
      maximumTrackTintColor={trackColor}
      thumbTintColor={colorLight}
      onSlidingStart={() => setSliding(true)}
      onValueChange={(v) => onScrub?.(v)}
      onSlidingComplete={(v) => {
        setSliding(false);
        onScrubComplete?.(v);
      }}
    />
  );
}

const styles = StyleSheet.create({
  slider: {
    width: '100%',
    height: 40,
  },
});
