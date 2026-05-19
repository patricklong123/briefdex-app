import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

interface Props {
  /** 0..1 */
  progress: number;
  /** track height in px */
  height?: number;
  /** show the glowing dot at the end of the filled portion */
  showDot?: boolean;
  trackColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 3,
  showDot = true,
  trackColor = colors.line,
  style,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = `${clamped * 100}%` as const;
  const dotSize = Math.max(height + 5, 8);

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.gold, colors.goldLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.fill,
          { width: pct, height, borderRadius: height / 2 },
        ]}
      />
      {showDot && clamped > 0 && clamped < 1 && (
        <View
          style={[
            styles.dot,
            {
              left: pct,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              marginLeft: -dotSize / 2,
              top: (height - dotSize) / 2,
              shadowColor: colors.gold,
              shadowOpacity: 0.9,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'visible',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dot: {
    position: 'absolute',
    backgroundColor: colors.goldLight,
  },
});
