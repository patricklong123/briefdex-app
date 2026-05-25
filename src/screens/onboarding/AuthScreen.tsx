import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';
import { useApp } from '../../contexts/AppContext';

interface Props {
  onNext: () => void;
  onOpenLogin: () => void;
}

export function AuthScreen({ onNext, onOpenLogin }: Props) {
  const { signUp } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    setError(null);
    if (!name.trim()) {
      setError('Enter your full name.');
      return;
    }
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, name);
      onNext();
    } catch (e: any) {
      setError(e?.message ?? 'Could not sign up.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout centered>
      <Text style={styles.heading}>Let's get you set up.</Text>

      <View style={styles.inputWrap}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          editable={!submitting}
          style={styles.input}
        />
      </View>

      <View style={[styles.inputWrap, { marginTop: spacing.md }]}>
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
          autoComplete="password-new"
          secureTextEntry
          editable={!submitting}
          style={styles.input}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <GoldButton
        label={submitting ? 'Signing up…' : 'Sign up'}
        onPress={handleSignUp}
        disabled={submitting}
        style={{ marginTop: spacing.lg }}
      />

      <Text style={styles.legal}>🔒 We never share your data.</Text>

      <Pressable onPress={onOpenLogin} disabled={submitting} hitSlop={12} style={styles.loginLinkWrap}>
        <Text style={styles.loginLinkText}>
          Already have an account? <Text style={styles.loginLinkAction}>Log in</Text>
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
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.red,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  legal: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: spacing.lg,
  },
  loginLinkWrap: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textDim,
  },
  loginLinkAction: {
    fontFamily: fonts.bodySemiBold,
    color: colors.gold,
  },
});
