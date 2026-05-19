import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme/tokens';

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  disabled?: boolean;
}

export function SurveyOption({ label, selected, onPress, multi, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && !disabled && { transform: [{ scale: 0.995 }] },
        disabled && { opacity: 0.6 },
      ]}
    >
      <View
        style={[
          styles.indicator,
          multi ? styles.indicatorSquare : styles.indicatorRound,
          selected && styles.indicatorSelected,
        ]}
      >
        {selected && (multi ? <Text style={styles.check}>✓</Text> : <View style={styles.dot} />)}
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  rowSelected: {
    borderColor: colors.goldBorder,
    backgroundColor: 'rgba(201,168,76,0.10)',
  },
  indicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorRound: { borderRadius: 8 },
  indicatorSquare: { borderRadius: 4 },
  indicatorSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a1407',
  },
  check: {
    color: '#1a1407',
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 12,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 20,
  },
  labelSelected: {
    color: colors.white,
    fontFamily: fonts.bodyMedium,
  },
});
