import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { GoldButton } from '../components/GoldButton';
import { ChevronLeftIcon, CheckIcon } from '../components/Icons';
import { colors, fonts, radii, shadows, spacing } from '../theme/tokens';

interface Props {
  onBack: () => void;
}

const MONTHLY_PRICE = 19.99;
const ANNUAL_PRICE = 169.99;
const ANNUAL_AS_MONTHLY = 14.17;
const ANNUAL_EQUIVALENT_MONTHLY = MONTHLY_PRICE * 12; // 239.88
const SAVINGS = ANNUAL_EQUIVALENT_MONTHLY - ANNUAL_PRICE; // 69.89

const BENEFITS = [
  'All 5 channels, every weekday',
  'New episodes at 6am NZT daily',
  'Full listening history',
  'Offline listening (coming soon)',
];

export function AnnualPlanScreen({ onBack }: Props) {
  const handleSwitch = () => {
    Alert.alert(
      'Annual plan coming soon',
      "We'll notify you when it's available.",
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <ChevronLeftIcon />
            <Text style={styles.backText}>Subscription</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ANNUAL PLAN</Text>
            <Text style={styles.title}>Go Annual & Save</Text>
          </View>

          {/* Savings hero card */}
          <View style={[styles.heroShadow, shadows.card]}>
            <LinearGradient
              colors={[colors.g800, colors.g700, colors.g850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(201,168,76,0.22)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.5 }}
                style={StyleSheet.absoluteFillObject as any}
              />

              <Text style={styles.saveBig}>SAVE 33%</Text>
              <Text style={styles.priceBig}>$169.99 NZD / year</Text>
              <Text style={styles.priceMonthly}>
                That's ${ANNUAL_AS_MONTHLY.toFixed(2)} per month
              </Text>

              <View style={styles.heroDivider} />

              <Text style={styles.compareLine}>
                vs Currently paying $19.99/month = $239.88/year
              </Text>
              <Text style={styles.savingsLine}>
                You save ${SAVINGS.toFixed(2)} NZD every year
              </Text>
            </LinearGradient>
          </View>

          {/* Everything in Premium */}
          <Text style={styles.sectionLabel}>EVERYTHING IN PREMIUM</Text>
          <View style={[styles.benefitsShadow, shadows.subtle]}>
            <LinearGradient
              colors={[colors.g800, colors.g700, colors.g850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.benefitsCard}
            >
              <View style={{ gap: 12 }}>
                {BENEFITS.map((text) => (
                  <BenefitRow key={text} text={text} />
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* CTA */}
          <GoldButton
            label="Switch to Annual — $169.99 NZD"
            onPress={handleSwitch}
            large
            style={{ marginTop: spacing.xxl }}
          />
          <Text style={styles.ctaSubtitle}>
            Billed annually. Cancel anytime in Apple settings.
          </Text>

          {/* Legal */}
          <Text style={styles.legal}>
            Your current monthly subscription will be cancelled and replaced with an annual plan. The annual plan begins immediately. No refund for unused monthly period.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <View style={styles.benefitRow}>
      <View style={styles.benefitIcon}>
        <CheckIcon size={14} color={colors.gold} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
  header: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 27,
    color: colors.white,
    marginTop: 4,
  },
  heroShadow: { borderRadius: radii.xxl },
  heroCard: {
    borderRadius: radii.xxl,
    borderWidth: 1.5,
    borderColor: colors.goldBorder,
    padding: spacing.xxl,
    overflow: 'hidden',
    alignItems: 'center',
  },
  saveBig: {
    fontFamily: fonts.headingBlack,
    fontSize: 36,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  priceBig: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.white,
    marginTop: spacing.sm,
  },
  priceMonthly: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    marginTop: 6,
  },
  heroDivider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.line,
    marginVertical: spacing.lg,
  },
  compareLine: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
  },
  savingsLine: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gold,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  benefitsShadow: { borderRadius: radii.xl },
  benefitsCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.white,
    flex: 1,
  },
  ctaSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  legal: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    lineHeight: 15,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
