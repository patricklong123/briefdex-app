import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

const TAGS = ['NZ-first', 'Primary sources', 'Editor reviewed', '7:30am daily'];

export function BrandScreen({ onNext }: { onNext: () => void }) {
  return (
    <OnboardingLayout centered footer={<GoldButton label="Let's get started" onPress={onNext} large />}>
      <View style={styles.center}>
        <View style={styles.ring}>
          <Text style={styles.ringText}>Bdx</Text>
        </View>
        <Text style={styles.heading}>Built for New Zealanders.</Text>
        <Text style={styles.body}>
          Made in Auckland. Every script is sourced from primary material — NZX, RBNZ, Stats NZ —
          then reviewed by editors before it reaches you.
        </Text>

        <View style={styles.tagRow}>
          {TAGS.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing.lg },
  ring: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { fontFamily: fonts.heading, fontSize: 17, color: colors.gold },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 21,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldFaint,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.goldLight,
  },
});
