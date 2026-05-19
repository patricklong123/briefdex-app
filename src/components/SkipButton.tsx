import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme/tokens';

interface Props {
  direction: 'back' | 'forward';
  seconds?: number;
  onPress: () => void;
}

export function SkipButton({ direction, seconds = 15, onPress }: Props) {
  const handle = () => {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  };
  const path =
    direction === 'back'
      ? 'M4 12a8 8 0 102.34-5.66M4 4v4h4'
      : 'M20 12a8 8 0 11-2.34-5.66M20 4v4h-4';
  return (
    <Pressable onPress={handle} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.6 }]}>
      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" style={StyleSheet.absoluteFill}>
        <Path d={path} stroke={colors.white} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={styles.label}>{seconds}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.white,
    marginTop: 1,
  },
});
