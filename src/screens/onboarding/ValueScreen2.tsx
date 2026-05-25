import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { ScreenBackground } from '../../components/ScreenBackground';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, spacing } from '../../theme/tokens';

export function ValueScreen2({ onNext }: { onNext: () => void }) {
  return (
    <ScreenBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Visual — flex:1, clock centred in available space */}
        <View style={styles.visual}>
          {/* Clock + stat wrapper — padding-bottom leaves room for stat label below */}
          <View style={styles.clockWrap}>
            <Svg width={120} height={120} viewBox="0 0 120 120">
              {/* Face */}
              <Circle
                cx={60} cy={60} r={58}
                stroke="rgba(201,168,76,0.3)"
                strokeWidth={2}
                fill="rgba(201,168,76,0.04)"
              />
              {/* Hour hand — rotated -30° (points ~11 o'clock), 32px long */}
              <G rotation="-30" origin="60,60">
                <Line
                  x1={60} y1={60} x2={60} y2={28}
                  stroke={colors.gold}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </G>
              {/* Minute hand — rotated 120° (points ~4 o'clock), 44px long */}
              <G rotation="120" origin="60,60">
                <Line
                  x1={60} y1={60} x2={60} y2={16}
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </G>
              {/* Centre dot */}
              <Circle cx={60} cy={60} r={3} fill={colors.gold} />
            </Svg>

            {/* Stat label — sits below clock, matching HTML .clock-stat bottom:-36px */}
            <View style={styles.stat}>
              <Text style={styles.bigNum}>165 hrs</Text>
              <Text style={styles.bigLabel}>lost per year to reading</Text>
            </View>
          </View>
        </View>

        {/* Text content — natural height, anchored at bottom */}
        <View style={styles.content}>
          <Text style={styles.eyebrow}>THE COST</Text>
          <Text style={styles.heading}>What does that time cost you?</Text>
          <Text style={styles.body}>
            38 minutes a day. 165 hours a year. Three working weeks. Gone. Reading instead of
            listening, deciding, or sleeping.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <GoldButton label="Show me a better way" onPress={onNext} />
        </View>

      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  visual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Wrapper gives space below the clock face for the stat label
  clockWrap: {
    alignItems: 'center',
    paddingBottom: 48,
  },
  stat: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  bigNum: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.gold,
  },
  bigLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textDim,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: spacing.xxl,
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
