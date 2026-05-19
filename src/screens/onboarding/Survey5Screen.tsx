import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Right when I wake up' },
  { label: 'Morning shower or coffee' },
  { label: 'On my commute' },
  { label: 'At my desk before work' },
  { label: 'At the gym' },
  { label: 'Whenever I get a spare moment' },
];

export function Survey5Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={5}
      question="When do you listen best?"
      options={OPTIONS}
      initial={answers.listeningHabit}
      onNext={(v) => {
        setAnswers({ listeningHabit: v as string });
        onNext();
      }}
    />
  );
}
