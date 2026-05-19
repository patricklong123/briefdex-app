import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from './OnboardingLayout';
import { colors, fonts, radii, shadows, spacing } from '../../theme/tokens';
import { ProgressBar } from '../../components/ProgressBar';
import { formatShortDate } from '../../utils/date';

export function FirstUseScreen({ onListen }: { onListen: () => void }) {
  return (
    <OnboardingLayout centered>
      <Text style={styles.eyebrow}>WELCOME</Text>
      <Text style={styles.heading}>Welcome to Briefdex.</Text>
      <Text style={styles.sub}>Today's Daily Wrap is ready. Tap below to listen.</Text>

      <View style={styles.episode}>
        <Text style={styles.episodeEyebrow}>DAILY WRAP · TODAY</Text>
        <Text style={styles.episodeDate}>{formatShortDate(new Date())}</Text>
        <Text style={styles.episodeMeta}>7 min · NZX · RBNZ · Global Markets</Text>
        <ProgressBar progress={0} height={2} showDot={false} style={{ marginTop: 12 }} />
      </View>

      <View style={styles.playWrap}>
        <Pressable onPress={onListen} style={({ pressed }) => [pressed && { transform: [{ scale: 0.97 }] }]}>
          <LinearGradient
            colors={[colors.g600, colors.g500]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.play, shadows.subtle]}
          >
            <View style={styles.bigTriangle} />
          </LinearGradient>
        </Pressable>
      </View>

      <Text style={styles.tip}>
        Tomorrow at 7am, today's briefing will be waiting on your lock screen.
      </Text>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.g200,
  },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    marginTop: 6,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textDim,
    marginTop: 6,
  },
  episode: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  episodeEyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.gold,
  },
  episodeDate: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.textDim,
    marginTop: 4,
  },
  episodeMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 6,
  },
  playWrap: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  play: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  bigTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: colors.white,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 5,
  },
  tip: {
    fontFamily: fonts.headingItalic,
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
});
