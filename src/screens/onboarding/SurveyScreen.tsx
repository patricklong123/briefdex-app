import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { SurveyOption } from '../../components/SurveyOption';
import { colors, fonts, spacing } from '../../theme/tokens';

interface Props {
  step: number; // 1..6
  question: string;
  options: { label: string; locked?: boolean }[];
  multi?: boolean;
  initial?: string | string[];
  onNext: (value: string | string[]) => void;
}

export function SurveyScreen({ step, question, options, multi, initial, onNext }: Props) {
  const [single, setSingle] = useState<string | null>(
    !multi && typeof initial === 'string' ? initial : null,
  );
  const [multiSel, setMultiSel] = useState<string[]>(
    multi && Array.isArray(initial)
      ? initial
      : multi
        ? options.filter((o) => o.locked).map((o) => o.label)
        : [],
  );

  const canContinue = multi ? multiSel.length > 0 : single !== null;

  const toggle = (label: string, locked?: boolean) => {
    if (multi) {
      if (locked) return; // pre-checked, always on
      setMultiSel((prev) =>
        prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
      );
    } else {
      setSingle(label);
    }
  };

  const submit = () => {
    if (!canContinue) return;
    if (multi) onNext(multiSel);
    else if (single) onNext(single);
  };

  return (
    <OnboardingLayout
      footer={<GoldButton label="Continue" onPress={submit} disabled={!canContinue} />}
    >
      {/* Progress pips — dots: done=gold filled, active=gold outline, pending=dim */}
      <View style={styles.pips}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            style={[
              styles.pip,
              i < step && styles.pipDone,
              i === step && styles.pipActive,
            ]}
          />
        ))}
      </View>

      <Text style={styles.qNum}>Question {step} of 6</Text>
      <Text style={styles.question}>{question}</Text>

      <View style={{ gap: 10, marginTop: spacing.xl }}>
        {options.map((opt) => {
          const selected = multi
            ? multiSel.includes(opt.label)
            : single === opt.label;
          return (
            <SurveyOption
              key={opt.label}
              label={opt.label}
              multi={multi}
              selected={selected}
              disabled={opt.locked}
              onPress={() => toggle(opt.label, opt.locked)}
            />
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  pips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xxl,
  },
  pip: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  pipDone: {
    backgroundColor: colors.gold,
  },
  pipActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  qNum: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.25)',
    marginBottom: spacing.sm,
  },
  question: {
    fontFamily: fonts.headingBlack,
    fontSize: 19,
    lineHeight: 26,
    color: colors.white,
  },
});
