import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { OnboardingLayout } from './OnboardingLayout';
import { colors, fonts, spacing } from '../../theme/tokens';

const STATUSES = [
  'Analysing your responses…',
  'Confirming your delivery time…',
  'Setting up your channels…',
  'Preparing your first briefing…',
  'Almost ready…',
];

const STEPS = [
  'Analysing your responses',
  'Confirming your delivery time',
  'Setting up your channels',
  'Preparing your first briefing',
  'Almost ready…',
];

const TOTAL_MS = 6000;

const RING_SIZE = 148;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <OnboardingLayout centered>
      <View style={styles.center}>
        {/* Ring */}
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Track */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={RING_STROKE}
              fill="none"
            />
            {/* Animated arc — starts at 12 o'clock, sweeps clockwise */}
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              stroke={colors.gold}
              strokeWidth={RING_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={animatedRingProps}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          {/* Monogram */}
          <View style={styles.monogramWrap} pointerEvents="none">
            <Text style={styles.monogram}>Bdx</Text>
          </View>
        </View>

        {/* Rotating status */}
        <Text style={styles.status}>{STATUSES[statusIdx]}</Text>

        {/* Step list */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => {
            const state = i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending';
            return (
              <View key={s} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    state === 'done' && { backgroundColor: colors.gold, borderColor: colors.gold },
                    state === 'active' && {
                      borderColor: colors.gold,
                      backgroundColor: colors.goldFaint,
                    },
                  ]}
                >
                  {state === 'done' && <Text style={styles.tick}>✓</Text>}
                  {state === 'active' && <Text style={styles.arrow}>▶</Text>}
                  {state === 'pending' && <View style={styles.pendingDot} />}
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
  center: {
    alignItems: 'center',
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  monogramWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogram: {
    fontFamily: fonts.heading,
    fontSize: 32,
    color: colors.gold,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  status: {
    fontFamily: fonts.headingItalic,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
  steps: {
    gap: 10,
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: { color: '#1a1407', fontSize: 10, fontFamily: fonts.bodySemiBold },
  arrow: { color: colors.gold, fontSize: 8, fontFamily: fonts.bodySemiBold, marginLeft: 1 },
  pendingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  stepLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.white,
  },
});
