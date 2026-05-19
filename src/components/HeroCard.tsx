import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CHANNEL_THEMES, colors, fonts, radii, shadows, spacing } from '../theme/tokens';
import { Episode } from '../types';
import { ProgressBar } from './ProgressBar';
import { PulsingDot } from './PulsingDot';

interface Props {
  episode: Episode;
  positionSec: number;
  onPressPlay: () => void;
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function HeroCard({ episode, positionSec, onPressPlay }: Props) {
  const progress = episode.duration ? positionSec / episode.duration : 0;
  const durationLabel = `${Math.max(1, Math.round(episode.duration / 60))} min`;
  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPressPlay();
  };

  return (
    <View style={[styles.shadow, shadows.card]}>
      <LinearGradient
        colors={[colors.g800, colors.g700, colors.g850]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Subtle radial overlays */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(201,168,76,0.18)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.3, y: 0.4 }}
          style={StyleSheet.absoluteFillObject as any}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['transparent', 'rgba(45,106,66,0.25)']}
          start={{ x: 0.3, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject as any}
        />

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <PulsingDot size={6} />
            <Text style={styles.badgeText}>TODAY'S BRIEFING</Text>
          </View>
          <Text style={styles.duration}>{durationLabel}</Text>
        </View>

        {/* Title */}
        <Text style={styles.italic} numberOfLines={1}>{CHANNEL_THEMES['daily-wrap'].italicTitle}</Text>
        <Text style={styles.title}>{CHANNEL_THEMES['daily-wrap'].tagline}</Text>
        <Text style={styles.desc}>
          Today's NZX action, RBNZ signals and the overnight global moves you need before your first
          meeting.
        </Text>

        {/* Action row */}
        <View style={styles.actionRow}>
          <Pressable onPress={handlePlay} style={({ pressed }) => [styles.playBtn, pressed && { transform: [{ scale: 0.96 }] }]}>
            <View style={styles.playTriangle} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.continueLabel}>Continue listening</Text>
            <Text style={styles.ticker}>{episode.tickerData}</Text>
          </View>
        </View>

        {/* Progress */}
        <ProgressBar progress={progress} height={3} style={{ marginTop: spacing.lg }} />
        <View style={styles.progressLabels}>
          <Text style={styles.nowPlaying}>▸ NOW PLAYING</Text>
          <Text style={styles.timer}>
            {fmt(positionSec)} / {fmt(episode.duration)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radii.xxl,
  },
  card: {
    borderRadius: radii.xxl,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.xxl,
    overflow: 'hidden',
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
    fontSize: 26,
    lineHeight: 30,
    color: colors.white,
  },
  desc: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textDim,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: spacing.xl,
  },
  playBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 9,
    borderBottomWidth: 9,
    borderRightWidth: 0,
    borderLeftColor: '#1a1407',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 4,
  },
  continueLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.white,
  },
  ticker: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 2,
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
});
