import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, shadows, spacing } from '../../theme/tokens';
import { useApp } from '../../contexts/AppContext';
import { purchasePlan } from '../../services/subscriptionService';

const TERMS_URL = 'https://briefdex.com/terms-of-service.html';
const PRIVACY_URL = 'https://briefdex.com/privacy-policy.html';

const TRUST_PILLS = [
  { icon: '🔒', label: 'No charges\nuntil day 7' },
  { icon: '✕',  label: 'Cancel\nin 2 taps' },
  { icon: '🔔', label: 'Reminder\n2 days before' },
];

export function PaywallScreen({ onStartTrial }: { onStartTrial: () => void }) {
  const { user } = useApp();
  const firstName = user.name.split(' ')[0];
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const [purchasing, setPurchasing] = useState(false);

  const handleStartTrial = async () => {
    if (purchasing) return;
    setPurchasing(true);
    try {
      const outcome = await purchasePlan(plan);
      if (outcome.status === 'purchased') {
        onStartTrial();
      }
    } catch (e: any) {
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
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

          {/* Plan cards */}
          <View style={styles.plansContainer}>
            {/* Monthly card */}
            <Pressable
              onPress={() => setPlan('monthly')}
              style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
            >
              <View style={styles.planCardHeader}>
                <View style={[styles.planRadio, plan === 'monthly' && styles.planRadioActive]}>
                  {plan === 'monthly' && <View style={styles.planRadioDot} />}
                </View>
                <Text style={styles.planLabel}>Monthly</Text>
              </View>
              <Text style={styles.priceAmount}>
                $19.99{' '}
                <Text style={styles.priceCurrency}>NZD / mo</Text>
              </Text>
              <Text style={styles.pricePeriod}>billed monthly after free trial</Text>
            </Pressable>

            {/* Annual card */}
            <Pressable
              onPress={() => setPlan('annual')}
              style={[styles.planCard, plan === 'annual' && styles.planCardActive]}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planCardHeader}>
                <View style={[styles.planRadio, plan === 'annual' && styles.planRadioActive]}>
                  {plan === 'annual' && <View style={styles.planRadioDot} />}
                </View>
                <Text style={styles.planLabel}>Annual</Text>
              </View>
              <Text style={styles.priceAmount}>
                $169.99{' '}
                <Text style={styles.priceCurrency}>NZD / yr</Text>
              </Text>
              <Text style={styles.priceAnnualSave}>Save 33% — $14.17 / month</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <GoldButton
            label={purchasing ? 'Processing…' : 'Start 7-day free trial'}
            onPress={handleStartTrial}
            disabled={purchasing}
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
            By starting your trial, you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL(TERMS_URL)}>
              Terms of Service
            </Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_URL)}>
              Privacy Policy
            </Text>
            .
          </Text>

          {/* DEV ONLY - REMOVE BEFORE SUBMISSION */}
          {__DEV__ && (
            <Pressable onPress={onStartTrial} hitSlop={12}>
              <Text style={styles.devSkip}>Skip for testing →</Text>
            </Pressable>
          )}

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

  // Plan cards
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    backgroundColor: 'rgba(201,168,76,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: radii.xl,
    padding: spacing.lg,
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderColor: colors.gold,
    borderWidth: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.sm,
  },
  planLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.textDim,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  priceAnnualSave: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.goldLight,
    marginTop: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -9,
    right: spacing.lg,
    backgroundColor: colors.gold,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    color: colors.g900,
    letterSpacing: 1,
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
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    fontFamily: fonts.bodyMedium,
    color: colors.gold,
    textDecorationLine: 'underline',
  },

  // DEV ONLY - REMOVE BEFORE SUBMISSION
  devSkip: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.gold,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: spacing.sm,
  },
});
