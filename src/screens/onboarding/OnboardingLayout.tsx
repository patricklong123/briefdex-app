import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenBackground } from '../../components/ScreenBackground';
import { spacing } from '../../theme/tokens';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  footer?: React.ReactNode;
}

export function OnboardingLayout({ children, scroll = true, centered, style, footer }: Props) {
  const content = (
    <View style={[styles.inner, style]}>
      {children}
    </View>
  );
  return (
    <ScreenBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              styles.scroll,
              { flexGrow: 1 },
              centered && { justifyContent: 'center' },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: centered ? 'center' : 'flex-start' }}>
            {content}
          </View>
        )}
        {footer && <View style={styles.footer}>{footer}</View>}
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  inner: {},
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
