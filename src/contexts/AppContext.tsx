import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { statsService } from '../services/statsService';
import { storage } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { OnboardingAnswers, UserProfile } from '../types';

interface AppContextValue {
  onboardingComplete: boolean | null;
  openPlayerOnStart: boolean;
  clearOpenPlayerOnStart: () => void;
  answers: OnboardingAnswers;
  user: UserProfile;
  session: Session | null;
  authReady: boolean;
  pendingSignUp: boolean;
  setAnswers: (patch: Partial<OnboardingAnswers>) => Promise<void>;
  completeOnboarding: (openPlayer?: boolean) => Promise<void>;
  setUser: (patch: Partial<UserProfile>) => Promise<void>;
  resetAll: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestSignUp: () => Promise<void>;
  clearPendingSignUp: () => void;
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
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [pendingSignUp, setPendingSignUp] = useState(false);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('[auth] getSession on boot, session:', data.session ? data.session.user.email : null);
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('[auth] onAuthStateChange:', event, 'session:', s ? s.user.email : null);
      setSession(s);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
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
    setPendingSignUp(false);
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
    await supabase.auth.signOut().catch(() => {});
    await storage.reset();
    await statsService.reset();
    setOnboardingComplete(false);
    setAnswersState({});
    setUserState(DEFAULT_USER);
    setPendingSignUp(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[auth] signIn called for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('[auth] signIn error:', error.status, error.message);
      throw error;
    }
    console.log('[auth] signIn ok, session user:', data.session?.user.email);
    // Set session immediately rather than waiting on the listener.
    setSession(data.session);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    console.log('[auth] signUp called for:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.log('[auth] signUp error:', error.status, error.message);
      throw error;
    }
    console.log('[auth] signUp ok, session user:', data.session?.user.email);
    if (data.session) setSession(data.session);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const requestSignUp = useCallback(async () => {
    await storage.setOnboardingComplete(false);
    setOnboardingComplete(false);
    setPendingSignUp(true);
  }, []);

  const clearPendingSignUp = useCallback(() => {
    setPendingSignUp(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        onboardingComplete,
        openPlayerOnStart,
        clearOpenPlayerOnStart,
        answers,
        user,
        session,
        authReady,
        pendingSignUp,
        setAnswers,
        completeOnboarding,
        setUser,
        resetAll,
        signIn,
        signUp,
        sendPasswordReset,
        signOut,
        requestSignUp,
        clearPendingSignUp,
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
