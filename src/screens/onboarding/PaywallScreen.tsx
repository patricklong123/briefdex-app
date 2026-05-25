import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, shadows, spacing } from '../../theme/tokens';
import { useApp } from '../../contexts/AppContext';

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
  const heading = firstName
    ? `Your briefing is ready, ${firstName}.`
    : 'Your briefing is ready.';

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
          <Text style={styles.heading}>{heading}</Text>
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

          {/* CTA + pricing block */}
          <View style={styles.ctaBlock}>
            <GoldButton
              label="Start 7-day free trial"
              onPress={handleStartTrial}
              large
              style={shadows.goldButton}
            />
            <Text style={styles.priceLine}>then $19.99 NZD / month</Text>
            <Pressable onPress={handleStartTrial} hitSlop={6}>
              <Text style={styles.annualLine}>or save 33% — $169.99/year</Text>
            </Pressable>
          </View>

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
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
  },

  // Heading
  heading: {
    fontFamily: fonts.headingBlack,
    fontSize: 26,
    color: colors.white,
    lineHeight: 32,
  },
  sub: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    color: colors.textDim,
    lineHeight: 22,
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
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
  },
  trustIcon: {
    fontSize: 16,
    color: colors.gold,
  },
  trustText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 15,
  },

  // CTA + pricing block
  ctaBlock: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
  priceLine: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  annualLine: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gold,
    textAlign: 'center',
    marginTop: -spacing.xs,
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
