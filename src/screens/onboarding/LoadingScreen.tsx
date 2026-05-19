import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingLayout } from './OnboardingLayout';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

const STATUSES = [
  'Analysing your responses...',
  'Confirming your delivery time...',
  'Setting up your channels...',
  'Configuring your smart alarm...',
  'Preparing today\u2019s briefing...',
];

const STEPS = [
  'Analysing your responses',
  'Confirming your delivery time',
  'Setting up your channels',
  'Configuring your smart alarm',
  'Preparing today\u2019s briefing',
];

const TOTAL_MS = 6000;

export function LoadingScreen({ onNext }: { onNext: () => void }) {
  const [statusIdx, setStatusIdx] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const progress = useSharedValue(0);
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  useEffect(() => {
    progress.value = withTiming(1, { duration: TOTAL_MS, easing: Easing.inOut(Easing.ease) });
    const statusInterval = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, STATUSES.length - 1));
    }, TOTAL_MS / STATUSES.length);
    const stepInterval = setInterval(() => {
      setActiveStep((i) => Math.min(i + 1, STEPS.length));
    }, TOTAL_MS / STEPS.length);
    const done = setTimeout(() => onNextRef.current(), TOTAL_MS + 250);

    return () => {
      clearInterval(statusInterval);
      clearInterval(stepInterval);
      clearTimeout(done);
    };
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <OnboardingLayout centered>
      <View style={styles.center}>
        <Text style={styles.heading}>Analysing your responses...</Text>

        <View style={styles.track}>
          <Animated.View style={[styles.fillWrap, fillStyle]}>
            <LinearGradient
              colors={[colors.gold, colors.goldLight]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fill}
            />
          </Animated.View>
        </View>

        <Text style={styles.status}>{STATUSES[statusIdx]}</Text>

        <View style={styles.steps}>
          {STEPS.map((s, i) => {
            const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending';
            return (
              <View key={s} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    state === 'done' && { backgroundColor: colors.g500, borderColor: colors.g500 },
                    state === 'active' && {
                      borderColor: colors.gold,
                      backgroundColor: colors.goldFaint,
                    },
                  ]}
                >
                  {state === 'done' && <Text style={styles.tick}>✓</Text>}
                  {state === 'active' && <Text style={styles.arrow}>▸</Text>}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    state === 'pending' && { color: colors.textFaint },
                    state === 'active' && { color: colors.gold },
                  ]}
                >
                  {s}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  center: { gap: spacing.lg, paddingHorizontal: spacing.md },
  heading: {
    fontFamily: fonts.heading,
    fontSize: 19,
    color: colors.white,
    textAlign: 'center',
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fillWrap: { height: 3 },
  fill: { flex: 1, borderRadius: 2 },
  status: {
    fontFamily: fonts.headingItalic,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  steps: { gap: 10, marginTop: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { color: colors.white, fontSize: 10, fontFamily: fonts.bodySemiBold },
  arrow: { color: colors.gold, fontSize: 9, fontFamily: fonts.bodySemiBold },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.white,
  },
});
