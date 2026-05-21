import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../components/ScreenBackground';
import { GoldButton } from '../components/GoldButton';
import { PulsingDot } from '../components/PulsingDot';
import { ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '../components/Icons';
import { colors, fonts, radii, shadows, spacing } from '../theme/tokens';
import { useApp } from '../contexts/AppContext';

const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

interface Props {
  onBack: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function parseRenewsOn(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (!m) return null;
  const monthIdx = MONTHS.indexOf(m[2]);
  if (monthIdx < 0) return null;
  return new Date(Number(m[3]), monthIdx, Number(m[1]));
}

function daysUntil(target: Date): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((t - today) / 86_400_000);
}

interface RenewalDisplay {
  text: string;
  color: string;
  warn: boolean;
}

function renewalDisplay(renewsOn: string | undefined): RenewalDisplay {
  const target = parseRenewsOn(renewsOn);
  if (!target) {
    return { text: renewsOn ? `Renews ${renewsOn}` : 'Renewal date unavailable', color: colors.textDim, warn: false };
  }
  const days = daysUntil(target);
  if (days === 0) {
    return { text: 'Renews today', color: colors.gold, warn: false };
  }
  if (days < 0) {
    return { text: `Renewed ${renewsOn}`, color: colors.textDim, warn: false };
  }
  const dayWord = days === 1 ? 'day' : 'days';
  if (days <= 7) {
    return {
      text: `⚠ Renews in ${days} ${dayWord} · ${renewsOn}`,
      color: colors.gold,
      warn: true,
    };
  }
  return {
    text: `Renews in ${days} ${dayWord} · ${renewsOn}`,
    color: colors.textDim,
    warn: false,
  };
}

export function SubscriptionScreen({ onBack }: Props) {
  const { user } = useApp();
  const renewal = renewalDisplay(user.renewsOn);
  const [restoring, setRestoring] = useState(false);

  const openAppleSubscriptions = () => {
    Linking.openURL(APPLE_SUBSCRIPTIONS_URL).catch(() => {});
  };

  const handleRestore = () => {
    if (restoring) return;
    setRestoring(true);
    setTimeout(() => {
      setRestoring(false);
      Alert.alert('Purchases restored');
    }, 1500);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel subscription',
      "To cancel your subscription, you'll be taken to your Apple subscription settings.",
      [{ text: 'OK', onPress: openAppleSubscriptions }],
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
            <Text style={styles.backText}>Profile</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>SUBSCRIPTION</Text>
            <Text style={styles.title}>Your Plan</Text>
          </View>

          {/* Current plan card */}
          <View style={[styles.cardShadow, shadows.card]}>
            <LinearGradient
              colors={[colors.g800, colors.g700, colors.g850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planCard}
            >
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(201,168,76,0.15)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.5 }}
                style={StyleSheet.absoluteFillObject as any}
              />

              <View style={styles.badgeRow}>
                <View style={styles.premiumBadge}>
                  <PulsingDot size={5} />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              </View>

              <Text style={styles.planName}>Briefdex Premium</Text>
              <Text style={styles.planPrice}>$19.99 NZD / month</Text>
              <Text style={[styles.renewalText, { color: renewal.color }]}>
                {renewal.text}
              </Text>

              <View style={styles.divider} />

              <View style={{ gap: 10 }}>
                <BenefitRow text="All 5 channels unlocked" />
                <BenefitRow text="New episodes every weekday at 6am" />
                <BenefitRow text="Offline listening coming soon" />
              </View>
            </LinearGradient>
          </View>

          {/* Annual upgrade card */}
          <View style={styles.annualCard}>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 33%</Text>
            </View>
            <Text style={styles.annualTitle}>Switch to Annual</Text>
            <Text style={styles.annualPrice}>$169.99 NZD / year</Text>
            <Text style={styles.annualMonthly}>That's just $14.17 per month</Text>
            <GoldButton
              label="Switch to Annual"
              onPress={() => {}}
              style={{ marginTop: spacing.lg }}
            />
          </View>

          {/* Manage */}
          <Text style={styles.sectionLabel}>MANAGE</Text>
          <View style={{ gap: 8 }}>
            <ManageRow label="Manage subscription" onPress={openAppleSubscriptions} />
            <ManageRow
              label="Restore purchases"
              onPress={handleRestore}
              loading={restoring}
            />
            <ManageRow label="Cancel subscription" onPress={handleCancel} danger />
          </View>

          <Text style={styles.legal}>
            Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date. Manage your subscription in your Apple ID settings.
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
        <CheckIcon size={14} color={colors.g200} />
      </View>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function ManageRow({
  label,
  danger,
  onPress,
  loading,
}: {
  label: string;
  danger?: boolean;
  onPress?: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={loading ? undefined : onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.manageRow,
        pressed && !loading && { backgroundColor: 'rgba(255,255,255,0.04)' },
      ]}
    >
      <Text style={[styles.manageLabel, danger && { color: colors.red }]}>{label}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={colors.gold} />
      ) : (
        <ChevronRightIcon color={danger ? colors.redSoft : colors.textFaint} />
      )}
    </Pressable>
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
  cardShadow: { borderRadius: radii.xxl },
  planCard: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  badgeRow: { flexDirection: 'row' },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  premiumText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: colors.gold,
  },
  planName: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    marginTop: spacing.md,
  },
  planPrice: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gold,
    marginTop: 4,
  },
  renewalText: {
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.lg,
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
    backgroundColor: 'rgba(45,106,66,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(168,212,180,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.white,
    flex: 1,
  },
  annualCard: {
    marginTop: spacing.lg,
    padding: spacing.xl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.g850,
    overflow: 'hidden',
  },
  saveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  saveBadgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: '#1a1407',
  },
  annualTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
    paddingRight: 70,
  },
  annualPrice: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.gold,
    marginTop: 6,
  },
  annualMonthly: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textFaint,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  manageLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
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
