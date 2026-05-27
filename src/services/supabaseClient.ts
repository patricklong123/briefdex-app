import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};
const SUPABASE_URL = extra.supabaseUrl ?? '';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey ?? '';

function createStubClient(reason: string): SupabaseClient {
  const error = { name: 'SupabaseNotConfigured', message: reason, status: 500 } as const;
  const noSession = { data: { session: null }, error: null };
  const failure = { data: { session: null, user: null }, error };
  const auth = {
    getSession: async () => noSession,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    setSession: async () => failure,
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => failure,
    signUp: async () => failure,
    resetPasswordForEmail: async () => ({ data: null, error }),
    updateUser: async () => ({ data: { user: null }, error }),
  };
  return { auth } as unknown as SupabaseClient;
}

function initSupabase(): SupabaseClient {
  if (!SUPABASE_URL.startsWith('http')) {
    const reason =
      'Supabase URL is not configured. Set EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment. Auth features are disabled.';
    console.error('[supabase]', reason, { gotUrl: SUPABASE_URL });
    return createStubClient(reason);
  }
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[supabase] Failed to initialize client:', message, err);
    return createStubClient(`Supabase init failed: ${message}`);
  }
}

export const supabase = initSupabase();
