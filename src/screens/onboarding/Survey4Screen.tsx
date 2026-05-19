import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Confident in finance conversations' },
  { label: 'Making sharper investing decisions' },
  { label: 'Up to speed without it taking over my mornings' },
  { label: 'Understanding the RBNZ and why it matters' },
  { label: 'All of these' },
];

export function Survey4Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={4}
      question="Where do you want to be in six months?"
      options={OPTIONS}
      multi
      initial={answers.projection as string[]}
      onNext={(v) => {
        setAnswers({ projection: v as string[] });
        onNext();
      }}
    />
  );
}
