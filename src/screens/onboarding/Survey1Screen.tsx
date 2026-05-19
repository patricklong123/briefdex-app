import React from 'react';
import { SurveyScreen } from './SurveyScreen';
import { useApp } from '../../contexts/AppContext';

const OPTIONS = [
  { label: 'Finance professional' },
  { label: 'Active retail investor' },
  { label: 'Looking to become a better investor' },
  { label: 'Want to be more financially informed' },
  { label: 'Senior professional (non-finance)' },
  { label: 'Founder or business owner' },
  { label: 'Student or early-career' },
];

export function Survey1Screen({ onNext }: { onNext: () => void }) {
  const { answers, setAnswers } = useApp();
  return (
    <SurveyScreen
      step={1}
      question="Which best describes you?"
      options={OPTIONS}
      initial={answers.identity}
      onNext={(v) => {
        setAnswers({ identity: v as string });
        onNext();
      }}
    />
  );
}
