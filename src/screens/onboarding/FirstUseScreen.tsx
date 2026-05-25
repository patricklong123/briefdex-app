import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as RGradient, Stop, Ellipse } from 'react-native-svg';
import { ScreenBackground } from '../../components/ScreenBackground';
import { ProgressBar } from '../../components/ProgressBar';
import { PulsingDot } from '../../components/PulsingDot';
import { CHANNEL_THEMES, colors, fonts, radii, shadows, spacing } from '../../theme/tokens';
import { formatShortDate } from '../../utils/date';

export function FirstUseScreen({ onListen }: { onListen: () => void }) {
  const dailyWrap = CHANNEL_THEMES['daily-wrap'];

  return (
    <ScreenBackground>
      {/* Subtle radial gold glow at the very top */}
      <Svg
        style={styles.glow as any}
        width="100%"
        height={320}
        pointerEvents="none"
      >
        <Defs>
          <RGradient id="firstUseGlow" cx="50%" cy="0%" r="65%" fx="50%" fy="0%">
            <Stop offset="0%" stopColor={colors.gold} stopOpacity="0.18" />
            <Stop offset="55%" stopColor={colors.gold} stopOpacity="0.05" />
            <Stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
          </RGradient>
        </Defs>
        <Ellipse cx="50%" cy="0%" rx="75%" ry="55%" fill="url(#firstUseGlow)" />
      </Svg>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.eyebrow}>WELCOME</Text>
          <Text style={styles.heading}>Welcome to Briefdex.</Text>
          <Text style={styles.sub}>Your first briefing is ready.</Text>

          {/* Premium episode card */}
          <View style={[styles.cardShadow, shadows.card]}>
            <LinearGradient
              colors={[colors.g800, colors.g700, colors.g850]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              {/* Gold accent stripe down the left edge */}
              <View style={styles.accentStripe} />

              {/* Subtle gold/green wash */}
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(201,168,76,0.16)', 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0.3, y: 0.45 }}
                style={StyleSheet.absoluteFillObject as any}
              />
              <LinearGradient
                pointerEvents="none"
                colors={['transparent', 'rgba(45,106,66,0.22)']}
                start={{ x: 0.3, y: 0.55 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject as any}
              />

              {/* Top row: live badge + duration */}
              <View style={styles.topRow}>
                <View style={styles.badge}>
                  <PulsingDot size={6} />
                  <Text style={styles.badgeText}>{dailyWrap.badgeText}</Text>
                </View>
                <Text style={styles.duration}>7 min</Text>
              </View>

              {/* Title */}
              <Text style={styles.italic}>{dailyWrap.italicTitle}</Text>
              <Text style={styles.title}>{dailyWrap.tagline}</Text>

              {/* Meta */}
              <Text style={styles.meta}>
                {formatShortDate(new Date())} · NZX · RBNZ · Global Markets
              </Text>

              {/* Progress */}
              <ProgressBar
                progress={0}
                height={3}
                showDot={false}
                style={{ marginTop: spacing.lg }}
              />
              <View style={styles.progressLabels}>
                <Text style={styles.nowPlaying}>▸ NEW EPISODE</Text>
                <Text style={styles.timer}>0:00 / 7:00</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Large gold play button */}
          <View style={styles.playWrap}>
            <Pressable
              onPress={onListen}
              style={({ pressed }) => [
                styles.playOuter,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <View style={styles.playInner}>
                <View style={styles.playTriangle} />
              </View>
            </Pressable>
          </View>

          <Text style={styles.tip}>
            Tomorrow at 6:30am, your next briefing will be waiting.
          </Text>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    paddingBottom: spacing.xxxxl,
    justifyContent: 'flex-start',
  },

  // Header
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.headingBlack,
    fontSize: 30,
    lineHeight: 36,
    color: colors.white,
    marginTop: spacing.sm,
  },
  sub: {
    fontFamily: fonts.bodyLight,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textDim,
    marginTop: spacing.xs,
  },

  // Card
  cardShadow: {
    borderRadius: radii.xxl,
    marginTop: spacing.xxxl,
  },
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingVertical: spacing.xxl,
    paddingLeft: spacing.xxl + 6,
    paddingRight: spacing.xxl,
    overflow: 'hidden',
  },
  accentStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.gold,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  badgeText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  duration: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.textDim,
  },
  italic: {
    fontFamily: fonts.headingItalic,
    fontSize: 14,
    color: colors.goldLight,
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 28,
    color: colors.white,
  },
  meta: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.textDim,
    marginTop: spacing.md,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nowPlaying: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.gold,
  },
  timer: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
  },

  // Big play button
  playWrap: {
    alignItems: 'center',
    marginTop: spacing.xxxl + spacing.md,
  },
  playOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(201,168,76,0.10)',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  playInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderTopWidth: 13,
    borderBottomWidth: 13,
    borderRightWidth: 0,
    borderLeftColor: '#1a1407',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 5,
  },

  // Tip
  tip: {
    fontFamily: fonts.headingItalic,
    fontSize: 11,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: 'auto',
    paddingHorizontal: spacing.xl,
  },
});
