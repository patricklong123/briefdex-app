export type ChannelCategory = 'Local' | 'Policy' | 'Global' | 'Regional';

export interface Channel {
  id: string;
  name: string;
  letter: string;
  category: ChannelCategory;
  duration: string;
  description: string;
  /** progress 0..1, undefined = new */
  progress?: number;
  done?: boolean;
}

export interface Episode {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  duration: number; // seconds
  channel: string;
  audioUrl: string;
  tickerData?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  subscriptionTier: 'free' | 'trial' | 'premium';
  renewsOn?: string;
  stats: {
    streak: number;
    briefingsCompleted: number;
    minutesSaved: number;
  };
}

export interface OnboardingAnswers {
  identity?: string;
  goals?: string[];
  frustration?: string;
  projection?: string;
  listeningHabit?: string;
  channels?: string[];
}

export type PlaybackRate = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

export interface PlaybackState {
  episode: Episode | null;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  rate: PlaybackRate;
}
