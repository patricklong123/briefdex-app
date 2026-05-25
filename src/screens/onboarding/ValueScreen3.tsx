import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient as RGradient, Stop, Ellipse } from 'react-native-svg';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

export function ValueScreen3({ onNext }: { onNext: () => void }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Visual — flex:1 fills all space above text block */}
        <View style={styles.visualWrap}>
          {/* Main gradient: g900 at top (blends with background) → semi-transparent green → gold hint */}
          <LinearGradient
            colors={[
              colors.g900,
              'rgba(26,58,40,0.85)',
              'rgba(26,58,40,0.55)',
              'rgba(201,168,76,0.10)',
            ]}
            locations={[0, 0.3, 0.65, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Gold orb glow — bottom centre */}
          <Svg
            style={StyleSheet.absoluteFillObject as any}
            width="100%"
            height="100%"
          >
            <Defs>
              <RGradient id="orb" cx="50%" cy="80%" r="45%" fx="50%" fy="80%">
                <Stop offset="0%" stopColor={colors.gold} stopOpacity="0.45" />
                <Stop offset="50%" stopColor={colors.gold} stopOpacity="0.08" />
                <Stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
              </RGradient>
            </Defs>
            <Ellipse cx="50%" cy="80%" rx="55%" ry="35%" fill="url(#orb)" />
          </Svg>

          {/* Subtle horizontal scan line at bottom of visual */}
          <View style={styles.scanLine} />

          {/* Content inside the visual — sits at the bottom */}
          <View style={styles.visualContent}>
            <Text style={styles.headphones}>🎧</Text>
            <Text style={styles.time}>6:30 AM</Text>
            <Text style={styles.play}>▶ Today's Daily Wrap</Text>
          </View>
        </View>

        {/* Text block — natural height */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>THE PROMISE</Text>
          <Text style={styles.heading}>Imagine waking up already briefed.</Text>
          <Text style={styles.body}>
            Your alarm goes off. Today's Daily Wrap is already loaded — NZX overnight moves, the OCR
            read, what to watch before the open. You're informed before your feet hit the floor.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <GoldButton label="I want this" onPress={onNext} />
        </View>

      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  visualWrap: {
    flex: 1,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'flex-end',
  },
  scanLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.25)',
  },
  visualContent: {
    padding: spacing.xxl,
    gap: 6,
  },
  headphones: {
    fontSize: 34,
    opacity: 0.5,
  },
  time: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '300',
  },
  play: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.gold,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.gold,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.headingBlack,
    fontSize: 22,
    color: colors.white,
    marginTop: 10,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
