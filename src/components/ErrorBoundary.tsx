import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme/tokens';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={{ flex: 1, backgroundColor: colors.g900, padding: spacing.xxl, justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.heading, fontSize: 22, color: colors.white, marginBottom: spacing.lg }}>
          Something went wrong
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.textDim, marginBottom: spacing.lg }}>
          {error.message || 'An unexpected error occurred while starting the app.'}
        </Text>
        {error.stack ? (
          <ScrollView style={{ maxHeight: 240 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.textFaint }}>
              {error.stack}
            </Text>
          </ScrollView>
        ) : null}
      </View>
    );
  }
}
