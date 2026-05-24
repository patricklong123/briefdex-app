import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, shadows, spacing } from '../../theme/tokens';
import { useApp } from '../../contexts/AppContext';

const TRUST_PILLS = [
  { icon: '🔒', label: 'No charges\nuntil day 7' },
  { icon: '✕',  label: 'Cancel\nin 2 taps' },
  { icon: '🔔', label: 'Reminder\n2 days before' },
];

export function PaywallScreen({ onStartTrial }: { onStartTrial: () => void }) {
  const { user } = useApp();
  const firstName = user.name.split(' ')[0];
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleStartTrial = async () => {
    const result = await RevenueCatUI.presentPaywall();
    if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
      onStartTrial();
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >

          {/* Heading */}
          <Text style={styles.heading}>
            Your Daily Wrap and all channels are ready, {firstName}.
          </Text>
          <Text style={styles.sub}>Unlock everything with 7 days free.</Text>

          {/* Trust pills */}
          <View style={styles.trustRow}>
            {TRUST_PILLS.map((p) => (
              <View key={p.label} style={styles.trustPill}>
                <Text style={styles.trustIcon}>{p.icon}</Text>
                <Text style={styles.trustText}>{p.label}</Text>
              </View>
            ))}
          </View>

          {/* Price card */}
          <View style={styles.priceCard}>
            {/* Monthly option */}
            <Pressable
              onPress={() => setPlan('monthly')}
              style={[styles.planRow, plan === 'monthly' && styles.planRowActive]}
            >
              <View style={[styles.planRadio, plan === 'monthly' && styles.planRadioActive]}>
                {plan === 'monthly' && <View style={styles.planRadioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.priceAmount}>
                  $19.99{' '}
                  <Text style={styles.priceCurrency}>NZD / mo</Text>
                </Text>
                <Text style={styles.pricePeriod}>billed monthly after free trial</Text>
              </View>
            </Pressable>

            <View style={styles.priceDivider} />

            {/* Annual option */}
            <Pressable
              onPress={() => setPlan('annual')}
              style={[styles.planRow, plan === 'annual' && styles.planRowActive]}
            >
              <View style={[styles.planRadio, plan === 'annual' && styles.planRadioActive]}>
                {plan === 'annual' && <View style={styles.planRadioDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.priceAnnualAmount}>
                  $169.99{' '}
                  <Text style={styles.priceCurrency}>NZD / yr</Text>
                </Text>
                <Text style={styles.priceAnnualSave}>Save 33% — $14.17 / month</Text>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>BEST VALUE</Text>
              </View>
            </Pressable>
          </View>

          {/* CTA */}
          <GoldButton
            label="Start 7-day free trial"
            onPress={handleStartTrial}
            large
            style={shadows.goldButton}
          />

          {/* Dev annotation */}
          {__DEV__ && (
            <View style={styles.annotation}>
              <Text style={styles.annotationIcon}>⚠</Text>
              <Text style={styles.annotationText}>
                No close button · No skip option · The only way forward is to start your trial.
              </Text>
            </View>
          )}

          {/* Legal */}
          <Text style={styles.legal}>
            By starting your trial, you agree to our Terms and Privacy Policy.{'\n'}
            We'll send a reminder before your trial ends.
          </Text>

        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },

  // Heading
  heading: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    lineHeight: 30,
  },
  sub: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.textDim,
  },

  // Trust pills
  trustRow: {
    flexDirection: 'row',
    gap: 6,
  },
  trustPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  trustIcon: {
    fontSize: 14,
    color: colors.gold,
  },
  trustText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Price card
  priceCard: {
    backgroundColor: 'rgba(201,168,76,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.lg,
  },
  planRowActive: {
    backgroundColor: 'rgba(201,168,76,0.07)',
  },
  planRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  planRadioActive: {
    borderColor: colors.gold,
  },
  planRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  priceAmount: {
    fontFamily: fonts.headingBlack,
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
  priceCurrency: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  pricePeriod: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: spacing.lg,
  },
  priceAnnualAmount: {
    fontFamily: fonts.headingBlack,
    fontSize: 28,
    color: colors.white,
    lineHeight: 32,
  },
  priceAnnualSave: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.goldLight,
    marginTop: 2,
  },
  saveBadge: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexShrink: 0,
  },
  saveBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    color: colors.gold,
    letterSpacing: 0.8,
  },

  // Dev annotation
  annotation: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    borderRadius: radii.md,
    padding: 10,
  },
  annotationIcon: { fontSize: 12 },
  annotationText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 15,
  },

  // Legal
  legal: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
