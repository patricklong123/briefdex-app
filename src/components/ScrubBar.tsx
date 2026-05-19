import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';

interface Props {
  /** Current playback progress 0..1. Ignored visually while the user is dragging. */
  progress: number;
  /** Fires continuously while the user drags, with the new 0..1 ratio. */
  onScrub?: (ratio: number) => void;
  /** Fires when the user releases (or the gesture is terminated). */
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
  const [isDragging, setIsDragging] = useState(false);
  const [dragRatio, setDragRatio] = useState(0);
  const widthRef = useRef(0);
  const pageXRef = useRef(0);
  const dragRatioRef = useRef(0);
  const containerRef = useRef<View>(null);

  const measure = () => {
    containerRef.current?.measureInWindow((x, _y, w) => {
      pageXRef.current = x;
      widthRef.current = w;
    });
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    measure();
  };

  const ratioFromPageX = (pageX: number) => {
    const w = widthRef.current;
    if (w <= 0) return 0;
    return Math.max(0, Math.min(1, (pageX - pageXRef.current) / w));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        measure();
        setIsDragging(true);
        const r = ratioFromPageX(evt.nativeEvent.pageX);
        dragRatioRef.current = r;
        setDragRatio(r);
        onScrub?.(r);
      },
      onPanResponderMove: (_evt, gesture) => {
        const r = ratioFromPageX(gesture.moveX);
        dragRatioRef.current = r;
        setDragRatio(r);
        onScrub?.(r);
      },
      onPanResponderRelease: () => {
        setIsDragging(false);
        onScrubComplete?.(dragRatioRef.current);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        onScrubComplete?.(dragRatioRef.current);
      },
    }),
  ).current;

  const displayRatio = isDragging ? dragRatio : Math.max(0, Math.min(1, progress));
  const pct = `${displayRatio * 100}%` as const;
  const thumbSize = isDragging ? 18 : Math.max(height + 5, 10);

  return (
    <View
      ref={containerRef}
      onLayout={handleLayout}
      style={[styles.hitArea, style]}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          { height, backgroundColor: trackColor, borderRadius: height / 2 },
        ]}
      >
        <LinearGradient
          colors={[color, colorLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: pct, height, borderRadius: height / 2 }]}
        />
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              left: pct,
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              marginLeft: -thumbSize / 2,
              top: (height - thumbSize) / 2,
              backgroundColor: colorLight,
              shadowColor: color,
              shadowOpacity: isDragging ? 1 : 0.9,
              shadowRadius: isDragging ? 10 : 6,
            },
          ]}
        />
      </View>
    </View>
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
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: colors.goldLight,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
