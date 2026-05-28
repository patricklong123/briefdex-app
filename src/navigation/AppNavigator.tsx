import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useApp } from '../contexts/AppContext';
import { OnboardingNavigator } from '../screens/onboarding/OnboardingNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { AnnualPlanScreen } from '../screens/AnnualPlanScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ChannelKey, colors } from '../theme/tokens';

type Tab = 'home' | 'profile' | 'notifications' | 'subscription' | 'annual' | 'settings';

export function AppNavigator() {
  const {
    onboardingComplete,
    openPlayerOnStart,
    clearOpenPlayerOnStart,
    session,
    authReady,
    pendingSignUp,
    passwordRecoveryActive,
    requestSignUp,
  } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerChannel, setPlayerChannel] = useState<ChannelKey>('daily-wrap');

  const openPlayer = (channel?: ChannelKey) => {
    if (channel) setPlayerChannel(channel);
    setPlayerOpen(true);
  };

  useEffect(() => {
    if (openPlayerOnStart) {
      openPlayer('daily-wrap');
      clearOpenPlayerOnStart();
    }
  }, [openPlayerOnStart]);

  console.log(
    '[AppNavigator] render — authReady:', authReady,
    'session:', session ? session.user.email : null,
    'onboardingComplete:', onboardingComplete,
    'pendingSignUp:', pendingSignUp,
    'passwordRecoveryActive:', passwordRecoveryActive,
  );

  if (onboardingComplete === null || !authReady) {
    console.log('[AppNavigator] -> Loading');
    return <View style={{ flex: 1, backgroundColor: colors.g900 }} />;
  }

  // Password reset deep link opened the app — show the reset screen
  // regardless of session / onboarding state, then route normally.
  if (passwordRecoveryActive) {
    console.log('[AppNavigator] -> ResetPasswordScreen');
    return <ResetPasswordScreen />;
  }

  // Returning user: completed onboarding before, but no active session → standalone Login.
  if (!session && onboardingComplete && !pendingSignUp) {
    console.log('[AppNavigator] -> Standalone Login');
    return <LoginScreen onRequestSignUp={requestSignUp} />;
  }

  // First-time user, or returning user who tapped "Sign up" from Login,
  // or a freshly-signed-up user who hasn't finished the survey/paywall yet.
  if (!onboardingComplete) {
    console.log('[AppNavigator] -> OnboardingNavigator');
    return <OnboardingNavigator initialRouteName={pendingSignUp ? 'Auth' : undefined} />;
  }

  console.log('[AppNavigator] -> Main app');

  return (
    <View style={{ flex: 1, backgroundColor: colors.g900 }}>
      {tab === 'home' ? (
        <HomeScreen
          onOpenPlayer={openPlayer}
          onOpenProfile={() => setTab('profile')}
        />
      ) : tab === 'profile' ? (
        <ProfileScreen
          onOpenHome={() => setTab('home')}
          onOpenPlayer={() => openPlayer()}
          onOpenNotifications={() => setTab('notifications')}
          onOpenSubscription={() => setTab('subscription')}
          onOpenSettings={() => setTab('settings')}
        />
      ) : tab === 'notifications' ? (
        <NotificationsScreen onBack={() => setTab('profile')} />
      ) : tab === 'subscription' ? (
        <SubscriptionScreen
          onBack={() => setTab('profile')}
          onOpenAnnual={() => setTab('annual')}
        />
      ) : tab === 'annual' ? (
        <AnnualPlanScreen onBack={() => setTab('subscription')} />
      ) : (
        <SettingsScreen onBack={() => setTab('profile')} />
      )}

      <Modal
        visible={playerOpen}
        transparent
        animationType="none"
        onRequestClose={() => setPlayerOpen(false)}
      >
        {/* A Modal renders in its own native root, so the app-level
            GestureHandlerRootView and SafeAreaProvider do not reach it — the
            player needs its own, otherwise SafeAreaView gets zero insets and
            the header renders under the notch / Dynamic Island. */}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <PlayerScreen channelKey={playerChannel} onClose={() => setPlayerOpen(false)} />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}
