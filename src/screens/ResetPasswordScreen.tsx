import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingLayout } from './onboarding/OnboardingLayout';
import { GoldButton } from '../components/GoldButton';
import { colors, fonts, radii, spacing } from '../theme/tokens';
import { useApp } from '../contexts/AppContext';

const MIN_LENGTH = 8;

function friendlyAuthError(e: any, fallback = 'Could not update password.'): string {
  const msg: string = e?.message ?? '';
  if (/network|fetch|failed to fetch/i.test(msg)) return "Can't reach the server. Check your connection.";
  if (/same.*password|new password should be different/i.test(msg)) {
    return 'New password must be different from your current password.';
  }
  if (/weak|too short|at least/i.test(msg)) return `Password must be at least ${MIN_LENGTH} characters.`;
  return msg || fallback;
}

export function ResetPasswordScreen() {
  const { updatePassword, clearPasswordRecovery } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!password || !confirm) {
      setError('Enter your new password twice.');
      return;
    }
    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      // Session is still valid; AppNavigator will route to Home.
      clearPasswordRecovery();
    } catch (e: any) {
      setError(friendlyAuthError(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout centered>
      <Text style={styles.heading}>Set a new password.</Text>
      <Text style={styles.sub}>Choose a password you don't use anywhere else.</Text>

      <View style={[styles.inputWrap, { marginTop: spacing.xl }]}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoComplete="password-new"
          secureTextEntry
          editable={!submitting}
          style={styles.input}
        />
      </View>

      <View style={[styles.inputWrap, { marginTop: spacing.md }]}>
        <TextInput
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Confirm new password"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoComplete="password-new"
          secureTextEntry
          editable={!submitting}
          style={styles.input}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <GoldButton
        label={submitting ? 'Updating…' : 'Update password'}
        onPress={handleSubmit}
        disabled={submitting}
        style={{ marginTop: spacing.lg }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
  },
  sub: {
    fontFamily: fonts.bodyLight,
    fontSize: 13,
    color: colors.textDim,
    marginTop: spacing.sm,
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
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.red,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
