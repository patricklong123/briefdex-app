import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@briefdex/preferences';

export type PlaybackSpeed = 0.75 | 1.0 | 1.25 | 1.5 | 2.0;
export type SkipInterval = 10 | 15 | 30;

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.75, 1.0, 1.25, 1.5, 2.0];
export const SKIP_INTERVALS: SkipInterval[] = [10, 15, 30];

export interface Preferences {
  playbackSpeed: PlaybackSpeed;
  skipInterval: SkipInterval;
  autoplayNextChannel: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  playbackSpeed: 1.0,
  skipInterval: 15,
  autoplayNextChannel: true,
};

type Listener = (prefs: Preferences) => void;

class PreferencesService {
  private cache: Preferences | null = null;
  private inflight: Promise<Preferences> | null = null;
  private listeners = new Set<Listener>();

  async get(): Promise<Preferences> {
    if (this.cache) return this.cache;
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Preferences = raw
        ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) }
        : { ...DEFAULT_PREFERENCES };
      this.cache = parsed;
      this.inflight = null;
      return parsed;
    })();
    return this.inflight;
  }

  async update(patch: Partial<Preferences>): Promise<Preferences> {
    const current = await this.get();
    const next: Preferences = { ...current, ...patch };
    this.cache = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.listeners.forEach((l) => l(next));
    return next;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.get().then((p) => {
      if (this.listeners.has(listener)) listener(p);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const preferencesService = new PreferencesService();
