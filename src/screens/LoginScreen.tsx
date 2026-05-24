import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingLayout } from './onboarding/OnboardingLayout';
import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { useApp } from '../contexts/AppContext';

interface Props {
  onRequestSignUp: () => void;
}

function friendlyAuthError(e: any, fallback = 'Could not sign in.'): string {
  const msg: string = e?.message ?? '';
  const status: number | undefined = e?.status;
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email before logging in.';
  if (/user already registered/i.test(msg)) return 'An account with that email already exists.';
  if (/network|fetch|failed to fetch/i.test(msg)) return "Can't reach the server. Check your connection.";
  if (status === 429 || /rate.?limit/i.test(msg)) return 'Too many attempts. Try again in a minute.';
  return msg || fallback;
}

export function LoginScreen({ onRequestSignUp }: Props) {
  const { signIn, sendPasswordReset } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleLogIn = async () => {
    console.log('[LoginScreen] handleLogIn tapped, email:', email);
    setError(null);
    setResetSent(false);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      console.log('[LoginScreen] signIn resolved, AppNavigator should route to Home');
      // AppContext sets session synchronously; AppNavigator re-renders to Home.
    } catch (e: any) {
      console.log('[LoginScreen] signIn threw:', e?.status, e?.message, e);
      setError(friendlyAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setResetSent(false);
    if (!email) {
      setError('Enter your email above first.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (e: any) {
      setError(friendlyAuthError(e, 'Could not send reset email.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout centered>
      <Text style={styles.heading}>Welcome back.</Text>

      <View style={styles.inputWrap}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.co.nz"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          editable={!submitting}
          style={styles.input}
        />
      </View>

      <View style={[styles.inputWrap, { marginTop: spacing.md }]}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoComplete="password"
          secureTextEntry
          editable={!submitting}
          style={styles.input}
        />
      </View>

      <Pressable onPress={handleForgotPassword} disabled={submitting} hitSlop={8} style={styles.forgotWrap}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
      {resetSent && (
        <Text style={styles.success}>Check your email for a password reset link.</Text>
      )}

      <GoldButton
        label={submitting ? 'Logging in…' : 'Log In'}
        onPress={handleLogIn}
        disabled={submitting}
        style={{ marginTop: spacing.lg }}
      />

      <Pressable onPress={onRequestSignUp} disabled={submitting} hitSlop={12} style={styles.signUpLinkWrap}>
        <Text style={styles.signUpLinkText}>
          Don't have an account? <Text style={styles.signUpLinkAction}>Sign up</Text>
        </Text>
      </Pressable>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
    marginBottom: spacing.xxxl,
  },
  inputWrap: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  forgotText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.gold,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.red,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  success: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.gold,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  signUpLinkWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  signUpLinkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textDim,
  },
  signUpLinkAction: {
    fontFamily: fonts.bodySemiBold,
    color: colors.gold,
  },
});
