import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswers, UserProfile } from '../types';

const K = {
  onboardingComplete: '@briefdex/onboardingComplete',
  onboardingAnswers: '@briefdex/onboardingAnswers',
  userProfile: '@briefdex/userProfile',
  playbackPosition: (episodeId: string) => `@briefdex/playback/${episodeId}`,
};

export const storage = {
  async getOnboardingComplete(): Promise<boolean> {
    const v = await AsyncStorage.getItem(K.onboardingComplete);
    return v === '1';
  },
  async setOnboardingComplete(value: boolean): Promise<void> {
    await AsyncStorage.setItem(K.onboardingComplete, value ? '1' : '0');
  },
  async getOnboardingAnswers(): Promise<OnboardingAnswers> {
    const v = await AsyncStorage.getItem(K.onboardingAnswers);
    return v ? JSON.parse(v) : {};
  },
  async setOnboardingAnswers(answers: OnboardingAnswers): Promise<void> {
    await AsyncStorage.setItem(K.onboardingAnswers, JSON.stringify(answers));
  },
  async getUserProfile(): Promise<UserProfile | null> {
    const v = await AsyncStorage.getItem(K.userProfile);
    return v ? JSON.parse(v) : null;
  },
  async setUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(K.userProfile, JSON.stringify(profile));
  },
  async getPlaybackPosition(episodeId: string): Promise<number> {
    const v = await AsyncStorage.getItem(K.playbackPosition(episodeId));
    return v ? Number(v) : 0;
  },
  async setPlaybackPosition(episodeId: string, positionSec: number): Promise<void> {
    await AsyncStorage.setItem(K.playbackPosition(episodeId), String(positionSec));
  },
  async reset(): Promise<void> {
    await AsyncStorage.clear();
  },
};
