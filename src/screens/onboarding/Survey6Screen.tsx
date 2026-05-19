import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Daily Wrap (7 min)' },
  { label: 'NZ Markets (5 min)' },
  { label: 'Global Markets (4 min)' },
  { label: 'Trans-Tasman (3 min)' },
  { label: 'Macro & RBNZ (1–4 min)' },
];

export function Survey6Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={6}
      question="Which channels do you want each morning?"
      options={OPTIONS}
      multi
      initial={answers.channels}
      onNext={(v) => {
        setAnswers({ channels: v as string[] });
        onNext();
      }}
    />
  );
}
