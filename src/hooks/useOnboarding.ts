import { useCallback, useEffect, useState } from 'react';
import { storage } from '../services/storageService';
import { OnboardingAnswers } from '../types';

export function useOnboarding() {
  const [complete, setComplete] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  useEffect(() => {
    (async () => {
      const [c, a] = await Promise.all([
        storage.getOnboardingComplete(),
        storage.getOnboardingAnswers(),
      ]);
      setComplete(c);
      setAnswers(a);
    })();
  }, []);

  const updateAnswers = useCallback(
    async (patch: Partial<OnboardingAnswers>) => {
      const next = { ...answers, ...patch };
      setAnswers(next);
      await storage.setOnboardingAnswers(next);
    },
    [answers],
  );

  const finish = useCallback(async () => {
    await storage.setOnboardingComplete(true);
    setComplete(true);
  }, []);

  const reset = useCallback(async () => {
    await storage.reset();
    setComplete(false);
    setAnswers({});
  }, []);

  return { complete, answers, updateAnswers, finish, reset };
}
