import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

const SOURCES: { name: string; color: string }[] = [
  { name: 'NZX Announce...', color: colors.g500 },
  { name: 'RBNZ Statement', color: colors.gold },
  { name: 'Bloomberg', color: colors.blue },
  { name: 'Stats NZ Data', color: colors.g500 },
  { name: 'ASX Close', color: colors.gold },
  { name: 'RBA Decision', color: colors.blue },
  { name: 'GDT Dairy', color: colors.g500 },
  { name: 'Beehive', color: colors.gold },
  { name: 'CME Futures', color: colors.blue },
  { name: 'EIA Energy', color: colors.red },
];

export function ValueScreen1({ onNext }: { onNext: () => void }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Visual — flex:1, chips grid centred in the available space */}
        <View style={styles.visual}>
          <View style={styles.grid}>
            {SOURCES.map((s) => (
              <View key={s.name} style={styles.chip}>
                <View style={[styles.dot, { backgroundColor: s.color }]} />
                <Text style={styles.chipText}>{s.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Text content — natural height, anchored towards the bottom */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>THE PROBLEM</Text>
          <Text style={styles.heading}>You're drowning in finance news.</Text>
          <Text style={styles.body}>
            NZX announcements. RBNZ releases. Stats NZ data. Bloomberg. RBA. Every morning,
            scattered across sources. By the time you've caught up, the market is already open.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <GoldButton label="I feel this" onPress={onNext} />
        </View>

      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  // Visual area fills remaining space, centres the chip grid
  visual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    flexShrink: 0,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  // Text block — natural height, sits at bottom above footer
  content: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.headingBlack,
    fontSize: 22,
    color: colors.white,
    marginTop: 10,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
