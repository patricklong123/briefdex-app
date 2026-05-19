import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { OnboardingLayout } from './OnboardingLayout';
import { GoldButton } from '../../components/GoldButton';
import { colors, fonts, radii, spacing } from '../../theme/tokens';

export function AuthScreen({ onNext }: { onNext: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <OnboardingLayout centered>
      <Text style={styles.heading}>Let's get you set up.</Text>

      <SocialButton label="Continue with Apple" iconColor={colors.white} icon="" onPress={onNext} />
      <View style={{ height: 10 }} />
      <SocialButton
        label="Continue with Google"
        icon="G"
        iconColor={colors.blue}
        onPress={onNext}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.co.nz"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
      </View>

      <GoldButton label="Continue with email" onPress={onNext} style={{ marginTop: spacing.lg }} />

      <Text style={styles.legal}>🔒 We never share your data.</Text>
    </OnboardingLayout>
  );
}

function SocialButton({
  label,
  icon,
  iconColor,
  onPress,
}: {
  label: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.social, pressed && { opacity: 0.75 }]}
    >
      <View style={styles.socialIcon}>
        {icon ? (
          <Text style={[styles.socialIconText, { color: iconColor }]}>{icon}</Text>
        ) : (
          <Text style={[styles.appleGlyph]}></Text>
        )}
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: fonts.heading,
    fontSize: 26,
    color: colors.white,
    marginBottom: spacing.xxxl,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  socialIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
  },
  appleGlyph: {
    color: colors.white,
    fontSize: 18,
  },
  socialLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontFamily: fonts.body, fontSize: 11, color: colors.textFaint },
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
  legal: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: spacing.lg,
  },
});
