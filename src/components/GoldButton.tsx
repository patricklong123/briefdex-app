import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radii, shadows } from '../theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  large?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function GoldButton({ label, onPress, disabled, large, style, labelStyle }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        large && styles.wrapperLarge,
        shadows.goldButton,
        pressed && { transform: [{ scale: 0.98 }] },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.goldLight, colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, large && styles.gradientLarge]}
      >
        <Text style={[styles.label, large && styles.labelLarge, labelStyle]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radii.lg,
    overflow: 'visible',
  },
  wrapperLarge: {
    borderRadius: radii.lg,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientLarge: {
    paddingVertical: 18,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: '#1a1407',
    letterSpacing: 0.3,
  },
  labelLarge: {
    fontSize: 16,
  },
});
