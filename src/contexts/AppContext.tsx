import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { statsService } from '../services/statsService';
import { storage } from '../services/storageService';
import { OnboardingAnswers, UserProfile } from '../types';

interface AppContextValue {
  onboardingComplete: boolean | null;
  openPlayerOnStart: boolean;
  clearOpenPlayerOnStart: () => void;
  answers: OnboardingAnswers;
  user: UserProfile;
  setAnswers: (patch: Partial<OnboardingAnswers>) => Promise<void>;
  completeOnboarding: (openPlayer?: boolean) => Promise<void>;
  setUser: (patch: Partial<UserProfile>) => Promise<void>;
  resetAll: () => Promise<void>;
}

const DEFAULT_USER: UserProfile = {
  name: 'Patrick Long',
  email: 'patrick@briefdex.co.nz',
  subscriptionTier: 'premium',
  renewsOn: '12 June 2026',
  stats: { streak: 14, briefingsCompleted: 42, pagesDigested: 945 },
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [openPlayerOnStart, setOpenPlayerOnStart] = useState(false);
  const [answers, setAnswersState] = useState<OnboardingAnswers>({});
  const [user, setUserState] = useState<UserProfile>(DEFAULT_USER);

  useEffect(() => {
    (async () => {
      const [c, a, u] = await Promise.all([
        storage.getOnboardingComplete(),
        storage.getOnboardingAnswers(),
        storage.getUserProfile(),
      ]);
      setOnboardingComplete(c);
      setAnswersState(a);
      if (u) setUserState(u);
    })();
  }, []);

  const setAnswers = useCallback(
    async (patch: Partial<OnboardingAnswers>) => {
      setAnswersState((prev) => {
        const next = { ...prev, ...patch };
        storage.setOnboardingAnswers(next);
        return next;
      });
    },
    [],
  );

  const completeOnboarding = useCallback(async (openPlayer = false) => {
    await storage.setOnboardingComplete(true);
    setOpenPlayerOnStart(openPlayer);
    setOnboardingComplete(true);
  }, []);

  const clearOpenPlayerOnStart = useCallback(() => {
    setOpenPlayerOnStart(false);
  }, []);

  const setUser = useCallback(async (patch: Partial<UserProfile>) => {
    setUserState((prev) => {
      const next = { ...prev, ...patch };
      storage.setUserProfile(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(async () => {
    await storage.reset();
    await statsService.reset();
    setOnboardingComplete(false);
    setAnswersState({});
    setUserState(DEFAULT_USER);
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        openPlayerOnStart,
        clearOpenPlayerOnStart,
        answers,
        user,
        setAnswers,
        completeOnboarding,
        setUser,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
