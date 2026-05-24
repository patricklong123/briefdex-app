import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { OnboardingNavigator } from '../screens/onboarding/OnboardingNavigator';
import { LoginScreen } from '../screens/LoginScreen';
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
  );

  if (onboardingComplete === null || !authReady) {
    console.log('[AppNavigator] -> Loading');
    return <View style={{ flex: 1, backgroundColor: colors.g900 }} />;
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
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlayerOpen(false)}
      >
        <PlayerScreen channelKey={playerChannel} onClose={() => setPlayerOpen(false)} />
      </Modal>
    </View>
  );
}
