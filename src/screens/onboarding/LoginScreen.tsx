import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

interface Props {
  onLogIn: () => void;
}

export function LoginScreen({ onLogIn }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          style={styles.input}
        />
      </View>

      <GoldButton label="Log In" onPress={onLogIn} style={{ marginTop: spacing.lg }} />
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
});
