import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, spacing } from '../../theme/tokens';

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <OnboardingLayout centered footer={<GoldButton label="Get started" onPress={onNext} large />}>
      <View style={styles.center}>
        <View style={styles.orbOuter}>
          <View style={styles.orbMid}>
            <View style={styles.orbInner} />
          </View>
        </View>
        <Text style={styles.brand}>Briefdex</Text>
        <Text style={styles.tagline}>Markets before your first coffee.</Text>
        <Text style={styles.sub}>New Zealand's daily audio briefing for serious investors.</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  orbOuter: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: colors.goldBorder,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.gold, shadowOpacity: 0.4, shadowRadius: 30, shadowOffset: { width: 0, height: 0 },
  },
  orbMid: {
    width: 86, height: 86, borderRadius: 43,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  orbInner: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.gold,
    shadowColor: colors.gold, shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 0 },
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: 40,
    color: colors.gold,
    marginTop: spacing.xl,
  },
  tagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginTop: 4,
  },
});
