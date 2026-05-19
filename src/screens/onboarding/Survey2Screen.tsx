import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Stay informed without 45 mins of reading' },
  { label: 'Understand the NZX before my first meeting' },
  { label: 'Better KiwiSaver decisions' },
  { label: 'Be the most informed in the room' },
  { label: 'Stay across my investments day to day' },
];

export function Survey2Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={2}
      question="What brings you to Briefdex?"
      options={OPTIONS}
      multi
      initial={answers.goals}
      onNext={(v) => {
        setAnswers({ goals: v as string[] });
        onNext();
      }}
    />
  );
}
