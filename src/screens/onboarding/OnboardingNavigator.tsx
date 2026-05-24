import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from './WelcomeScreen';
import { AuthScreen } from './AuthScreen';
import { LoginScreen } from '../LoginScreen';
import { ValueScreen1 } from './ValueScreen1';
import { ValueScreen2 } from './ValueScreen2';
import { ValueScreen3 } from './ValueScreen3';
import { ValueScreen4 } from './ValueScreen4';
import { SocialProofScreen } from './SocialProofScreen';
import { Survey1Screen } from './Survey1Screen';
import { Survey2Screen } from './Survey2Screen';
import { Survey3Screen } from './Survey3Screen';
import { Survey4Screen } from './Survey4Screen';
import { Survey5Screen } from './Survey5Screen';
import { Survey6Screen } from './Survey6Screen';
import { BrandScreen } from './BrandScreen';
import { LoadingScreen } from './LoadingScreen';
import { PaywallScreen } from './PaywallScreen';
import { FirstUseScreen } from './FirstUseScreen';
import { useApp } from '../../contexts/AppContext';

export type OnboardingStackParams = {
  Welcome: undefined;
  Auth: undefined;
  Login: undefined;
  Value1: undefined;
  Value2: undefined;
  Value3: undefined;
  Value4: undefined;
  SocialProof: undefined;
  Survey1: undefined;
  Survey2: undefined;
  Survey3: undefined;
  Survey4: undefined;
  Survey5: undefined;
  Survey6: undefined;
  Brand: undefined;
  Loading: undefined;
  Paywall: undefined;
  FirstUse: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParams>();

interface Props {
  initialRouteName?: keyof OnboardingStackParams;
}

export function OnboardingNavigator({ initialRouteName }: Props = {}) {
  const { completeOnboarding } = useApp();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName ?? 'Welcome'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Welcome">
        {({ navigation }) => <WelcomeScreen onNext={() => navigation.navigate('Auth')} />}
      </Stack.Screen>
      <Stack.Screen name="Auth">
        {({ navigation }) => (
          <AuthScreen
            onNext={() => navigation.navigate('Value1')}
            onOpenLogin={() => navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen onRequestSignUp={() => navigation.navigate('Auth')} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Value1">
        {({ navigation }) => <ValueScreen1 onNext={() => navigation.navigate('Value2')} />}
      </Stack.Screen>
      <Stack.Screen name="Value2">
        {({ navigation }) => <ValueScreen2 onNext={() => navigation.navigate('Value3')} />}
      </Stack.Screen>
      <Stack.Screen name="Value3">
        {({ navigation }) => <ValueScreen3 onNext={() => navigation.navigate('Value4')} />}
      </Stack.Screen>
      <Stack.Screen name="Value4">
        {({ navigation }) => <ValueScreen4 onNext={() => navigation.navigate('SocialProof')} />}
      </Stack.Screen>
      <Stack.Screen name="SocialProof">
        {({ navigation }) => <SocialProofScreen onNext={() => navigation.navigate('Survey1')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey1">
        {({ navigation }) => <Survey1Screen onNext={() => navigation.navigate('Survey2')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey2">
        {({ navigation }) => <Survey2Screen onNext={() => navigation.navigate('Survey3')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey3">
        {({ navigation }) => <Survey3Screen onNext={() => navigation.navigate('Survey4')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey4">
        {({ navigation }) => <Survey4Screen onNext={() => navigation.navigate('Survey5')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey5">
        {({ navigation }) => <Survey5Screen onNext={() => navigation.navigate('Survey6')} />}
      </Stack.Screen>
      <Stack.Screen name="Survey6">
        {({ navigation }) => <Survey6Screen onNext={() => navigation.navigate('Brand')} />}
      </Stack.Screen>
      <Stack.Screen name="Brand">
        {({ navigation }) => <BrandScreen onNext={() => navigation.navigate('Loading')} />}
      </Stack.Screen>
      <Stack.Screen
        name="Loading"
        options={{ gestureEnabled: false, animation: 'fade' }}
      >
        {({ navigation }) => <LoadingScreen onNext={() => navigation.navigate('Paywall')} />}
      </Stack.Screen>
      {/* HARD PAYWALL — no back gesture, no header, can't dismiss except by starting trial */}
      <Stack.Screen
        name="Paywall"
        options={{ gestureEnabled: false, headerBackVisible: false, animation: 'fade' }}
      >
        {() => (
          <PaywallScreen onStartTrial={() => completeOnboarding(true)} />
        )}
      </Stack.Screen>
      <Stack.Screen name="FirstUse" options={{ gestureEnabled: false }}>
        {() => <FirstUseScreen onListen={() => completeOnboarding(true)} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
