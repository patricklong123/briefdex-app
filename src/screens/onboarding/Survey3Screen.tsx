import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Too fragmented across sources' },
  { label: 'Not focused on New Zealand' },
  { label: 'Written not audio' },
  { label: 'Behind too many paywalls' },
  { label: "I don't know where to even start" },
  { label: 'All of the above' },
];

export function Survey3Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={3}
      question="What frustrates you most about finance news?"
      options={OPTIONS}
      initial={answers.frustration}
      onNext={(v) => {
        setAnswers({ frustration: v as string });
        onNext();
      }}
    />
  );
}
