import React, { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import { useApp } from '../contexts/AppContext';
import { OnboardingNavigator } from '../screens/onboarding/OnboardingNavigator';
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
  const { onboardingComplete, openPlayerOnStart, clearOpenPlayerOnStart } = useApp();
  const [tab, setTab] = useState<Tab>('home');
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerChannel, setPlayerChannel] = useState<ChannelKey>('daily-wrap');

  // When called with a channel, switch to it; otherwise resume the last channel
  // (so the "Now Playing" pill in the bottom nav doesn't reset back to Daily Wrap).
  const openPlayer = (channel?: ChannelKey) => {
    if (channel) setPlayerChannel(channel);
    setPlayerOpen(true);
  };

  // Open the player automatically when coming from the FirstUse screen
  useEffect(() => {
    if (openPlayerOnStart) {
      openPlayer('daily-wrap');
      clearOpenPlayerOnStart();
    }
  }, [openPlayerOnStart]);

  if (onboardingComplete === null) {
    return <View style={{ flex: 1, backgroundColor: colors.g900 }} />;
  }

  if (!onboardingComplete) {
    return <OnboardingNavigator />;
  }

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
