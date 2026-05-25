import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

const SOURCES = [
  { abbr: 'NZX',  name: 'Announcements' },
  { abbr: 'RBNZ', name: 'Releases & OCR' },
  { abbr: 'SNZ',  name: 'Stats NZ Data' },
  { abbr: 'BBG',  name: 'Bloomberg' },
];

export function ValueScreen4({ onNext }: { onNext: () => void }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Visual — flex:1, source pipeline centred */}
        <View style={styles.visual}>
          <View style={styles.sourceGrid}>
            {/* 2×2 source chips */}
            {SOURCES.map((s) => (
              <View key={s.abbr} style={styles.sourceChip}>
                <Text style={styles.sourceAbbr}>{s.abbr}</Text>
                <Text style={styles.sourceName}>{s.name}</Text>
              </View>
            ))}

            {/* Arrow — spans full width */}
            <View style={styles.arrowRow}>
              <Text style={styles.arrow}>↓ AI scripts + editor review ↓</Text>
            </View>

            {/* Final chip — spans full width */}
            <View style={styles.finalChip}>
              <Text style={styles.finalText}>🎙 Professional audio · 7:30am NZT</Text>
            </View>
          </View>
        </View>

        {/* Text content — natural height, anchored at bottom */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>THE METHOD</Text>
          <Text style={styles.heading}>Built on primary sources only.</Text>
          <Text style={styles.body}>
            No summarised journalism. Direct from NZX, RBNZ, Stats NZ, and Bloomberg.
            AI scripted. Editor reviewed. Voice generated.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <GoldButton label="Continue" onPress={onNext} />
        </View>

      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  visual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  sourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  sourceChip: {
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    gap: 4,
  },
  sourceAbbr: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  sourceName: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  arrowRow: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  arrow: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  finalChip: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    backgroundColor: 'rgba(201,168,76,0.08)',
    alignItems: 'center',
  },
  finalText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.gold,
  },
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
