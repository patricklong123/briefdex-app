import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radii, shadows, spacing } from '../theme/tokens';
import { ScreenBackground } from '../components/ScreenBackground';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../contexts/AppContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useStats } from '../hooks/useStats';
import {
  BellIcon,
  BookIcon,
  CardIcon,
  ChevronRightIcon,
  FlameIcon,
  GearIcon,
  LogoutIcon,
  SunriseIcon,
} from '../components/Icons';

interface Props {
  onOpenHome: () => void;
  onOpenPlayer: () => void;
  onOpenNotifications: () => void;
  onOpenSubscription: () => void;
  onOpenSettings: () => void;
}

export function ProfileScreen({
  onOpenHome,
  onOpenPlayer,
  onOpenNotifications,
  onOpenSubscription,
  onOpenSettings,
}: Props) {
  const { user, resetAll } = useApp();
  const player = useAudioPlayer();
  const stats = useStats();
  const initial = user.name.charAt(0);
  const pagesDigestedLabel = String(Math.round(stats.pagesDigested));

  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Profile card */}
          <View style={[styles.cardShadow, shadows.card]}>
            <LinearGradient
              colors={[colors.g800, colors.g700, colors.g850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(201,168,76,0.15)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.5 }}
                style={StyleSheet.absoluteFillObject as any}
              />

              {/* Identity */}
              <View style={styles.identityRow}>
                <LinearGradient
                  colors={[colors.goldLight, colors.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarLetter}>{initial}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={styles.email}>{user.email}</Text>
                </View>
                <View style={styles.premiumBadge}>
                  <View style={styles.premiumDot} />
                  <Text style={styles.premiumText}>PREMIUM</Text>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <StatCard
                  icon={<FlameIcon />}
                  value={String(stats.streak)}
                  label="Day streak"
                />
                <StatCard
                  icon={<SunriseIcon />}
                  value={String(stats.briefingsCompleted)}
                  label="Mornings ahead"
                />
                <StatCard
                  icon={<BookIcon />}
                  value={pagesDigestedLabel}
                  label="Pages digested"
                />
              </View>
            </LinearGradient>
          </View>

          {/* Settings */}
          <Text style={styles.sectionLabel}>SETTINGS</Text>
          <View style={{ gap: 8 }}>
            <MenuItem
              icon={<BellIcon />}
              label="Notifications"
              subtitle="Daily delivery time, alerts"
              onPress={onOpenNotifications}
            />
            <MenuItem
              icon={<CardIcon />}
              label="Subscription"
              subtitle={`Premium · Renews ${user.renewsOn}`}
              onPress={onOpenSubscription}
            />
            <MenuItem
              icon={<GearIcon />}
              label="Settings"
              subtitle="Playback, voice, privacy"
              onPress={onOpenSettings}
            />
          </View>

          {/* Logout */}
          <Pressable onPress={resetAll} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
            <LogoutIcon />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>

          {/* TODO: remove before App Store submission */}
          {__DEV__ && (
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Reset onboarding?',
                  'Clears AsyncStorage and returns to the onboarding flow.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: () => resetAll() },
                  ],
                )
              }
              style={({ pressed }) => [styles.devButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.devBadge}>DEV ONLY</Text>
              <Text style={styles.devButtonText}>Reset Onboarding</Text>
            </Pressable>
          )}

          <Text style={styles.version}>Briefdex v1.0 · MVP · May 2026</Text>
        </ScrollView>

        <BottomNav
          active="profile"
          onSelect={(t) => {
            if (t === 'home') onOpenHome();
          }}
          onPressNowPlaying={onOpenPlayer}
          isPlaying={player.isPlaying}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.statCard}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
    >
      <View style={styles.menuIconBox}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 140 },
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
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: '#1a1407',
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  premiumDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  premiumText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.gold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    gap: 6,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.textDim,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textFaint,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.white,
  },
  menuSubtitle: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textDim,
    marginTop: 2,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(232,92,92,0.4)',
    backgroundColor: 'rgba(232,92,92,0.06)',
    marginTop: spacing.xl,
  },
  logoutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.red,
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(201,168,76,0.05)',
    marginTop: spacing.md,
  },
  devBadge: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 8,
    letterSpacing: 1,
    color: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.35)',
  },
  devButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.gold,
  },
  version: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textGhost,
    marginTop: spacing.lg,
  },
});
