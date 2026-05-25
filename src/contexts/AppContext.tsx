import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { statsService } from '../services/statsService';
import { storage } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { OnboardingAnswers, UserProfile } from '../types';

const PASSWORD_RESET_REDIRECT = 'briefdex://reset-password';

function deriveDisplayName(sessionUser: Session['user'] | undefined): string | null {
  if (!sessionUser) return null;
  const meta = (sessionUser.user_metadata ?? {}) as { display_name?: string };
  if (meta.display_name && meta.display_name.trim()) return meta.display_name.trim();
  if (sessionUser.email) return sessionUser.email.split('@')[0];
  return null;
}

function parseUrlFragment(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return {};
  const fragment = url.substring(hashIndex + 1);
  const out: Record<string, string> = {};
  for (const pair of fragment.split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const k = eq === -1 ? pair : pair.substring(0, eq);
    const v = eq === -1 ? '' : pair.substring(eq + 1);
    if (k) out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

interface AppContextValue {
  onboardingComplete: boolean | null;
  openPlayerOnStart: boolean;
  clearOpenPlayerOnStart: () => void;
  answers: OnboardingAnswers;
  user: UserProfile;
  session: Session | null;
  authReady: boolean;
  pendingSignUp: boolean;
  passwordRecoveryActive: boolean;
  setAnswers: (patch: Partial<OnboardingAnswers>) => Promise<void>;
  completeOnboarding: (openPlayer?: boolean) => Promise<void>;
  setUser: (patch: Partial<UserProfile>) => Promise<void>;
  resetAll: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  requestSignUp: () => Promise<void>;
  clearPendingSignUp: () => void;
  clearPasswordRecovery: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: '',
  email: '',
  subscriptionTier: 'premium',
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
  const [passwordRecoveryActive, setPasswordRecoveryActive] = useState(false);

  useEffect(() => {
    (async () => {
      const [c, a, u, cachedName] = await Promise.all([
        storage.getOnboardingComplete(),
        storage.getOnboardingAnswers(),
        storage.getUserProfile(),
        storage.getUserName(),
      ]);
      setOnboardingComplete(c);
      setAnswersState(a);
      if (u) {
        setUserState(u);
      } else if (cachedName) {
        // No full profile yet but we have a cached name from a prior session.
        setUserState((prev) => ({ ...prev, name: cachedName }));
      }
    })();
  }, []);

  // Reconcile session → local user (name + email) whenever the session changes.
  useEffect(() => {
    if (!session) return;
    const displayName = deriveDisplayName(session.user);
    const email = session.user.email ?? '';
    setUserState((prev) => {
      if (prev.name === (displayName ?? '') && prev.email === email) return prev;
      const next: UserProfile = {
        ...prev,
        name: displayName ?? prev.name,
        email: email || prev.email,
      };
      storage.setUserProfile(next);
      return next;
    });
    if (displayName) storage.setUserName(displayName);
  }, [session?.user.id, session?.user.email, session?.user.user_metadata]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('[auth] getSession on boot, session:', data.session ? data.session.user.email : null);
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      console.log('[auth] onAuthStateChange:', event, 'session:', s ? s.user.email : null);
      setSession(s);
      if (event === 'PASSWORD_RECOVERY') {
        console.log('[auth] PASSWORD_RECOVERY event — showing reset screen');
        setPasswordRecoveryActive(true);
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleUrl = async (url: string | null) => {
      if (!url) return;
      console.log('[deeplink] received:', url);
      const params = parseUrlFragment(url);
      const isRecovery =
        params.type === 'recovery' ||
        url.includes('reset-password');
      if (!isRecovery) return;
      if (params.access_token && params.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error) {
          console.log('[deeplink] setSession error:', error.message);
          return;
        }
        console.log('[deeplink] recovery session set for:', data.session?.user.email);
        setSession(data.session);
      }
      setPasswordRecoveryActive(true);
    };
    Linking.getInitialURL().then(handleUrl);
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
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
    setPasswordRecoveryActive(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('[auth] signIn called for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.log('[auth] signIn error:', error.status, error.message);
      throw error;
    }
    console.log('[auth] signIn ok, session user:', data.session?.user.email);
    setSession(data.session);
    await storage.setOnboardingComplete(true);
    setOnboardingComplete(true);
    setPendingSignUp(false);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    console.log('[auth] signUp called for:', email);
    const trimmedName = name.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: trimmedName } },
    });
    if (error) {
      console.log('[auth] signUp error:', error.status, error.message);
      throw error;
    }
    console.log('[auth] signUp ok, session user:', data.session?.user.email);
    if (trimmedName) await storage.setUserName(trimmedName);
    if (data.session) setSession(data.session);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: PASSWORD_RESET_REDIRECT,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    console.log('[auth] updatePassword called');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.log('[auth] updatePassword error:', error.status, error.message);
      throw error;
    }
    console.log('[auth] updatePassword ok');
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

  const clearPasswordRecovery = useCallback(() => {
    setPasswordRecoveryActive(false);
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
        passwordRecoveryActive,
        setAnswers,
        completeOnboarding,
        setUser,
        resetAll,
        signIn,
        signUp,
        sendPasswordReset,
        updatePassword,
        signOut,
        requestSignUp,
        clearPendingSignUp,
        clearPasswordRecovery,
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
