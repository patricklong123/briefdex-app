import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@briefdex/stats';
// An average reader covers ~2.5 pages of dense financial content per minute,
// so every minute of audio maps to ~2.5 written pages "digested".
const PAGES_PER_MINUTE = 2.5;
const MS_PER_DAY = 86_400_000;

export interface Stats {
  streak: number;
  briefingsCompleted: number;
  pagesDigested: number;
  lastCompletedDate: string | null; // YYYY-MM-DD, local calendar day
}

export const EMPTY_STATS: Stats = {
  streak: 0,
  briefingsCompleted: 0,
  pagesDigested: 0,
  lastCompletedDate: null,
};

type Listener = (stats: Stats) => void;

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T00:00:00`).getTime();
  const b = new Date(`${toKey}T00:00:00`).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

function withEffectiveStreak(raw: Stats, today: string): Stats {
  if (!raw.lastCompletedDate) return raw;
  const gap = daysBetween(raw.lastCompletedDate, today);
  // Streak survives the day of last completion and the following day.
  // Once two full days have elapsed without a completion, it has lapsed.
  if (gap <= 1) return raw;
  return { ...raw, streak: 0 };
}

class StatsService {
  private cache: Stats | null = null;
  private inflight: Promise<Stats> | null = null;
  private listeners = new Set<Listener>();

  async getStats(): Promise<Stats> {
    const raw = await this.loadRaw();
    return withEffectiveStreak(raw, todayKey());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.getStats().then((s) => {
      if (this.listeners.has(listener)) listener(s);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  async recordCompletion(durationSeconds: number): Promise<void> {
    const raw = await this.loadRaw();
    const today = todayKey();
    const pages = (Math.max(0, durationSeconds) / 60) * PAGES_PER_MINUTE;

    let nextStreak: number;
    if (!raw.lastCompletedDate) {
      nextStreak = 1;
    } else if (raw.lastCompletedDate === today) {
      nextStreak = withEffectiveStreak(raw, today).streak;
    } else {
      const gap = daysBetween(raw.lastCompletedDate, today);
      nextStreak = gap === 1 ? raw.streak + 1 : 1;
    }

    const next: Stats = {
      streak: nextStreak,
      briefingsCompleted: raw.briefingsCompleted + 1,
      pagesDigested: raw.pagesDigested + pages,
      lastCompletedDate: today,
    };
    this.cache = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.notify(next);
  }

  async reset(): Promise<void> {
    this.cache = { ...EMPTY_STATS };
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notify(this.cache);
  }

  private notify(raw: Stats) {
    const effective = withEffectiveStreak(raw, todayKey());
    this.listeners.forEach((l) => l(effective));
  }

  private async loadRaw(): Promise<Stats> {
    if (this.cache) return this.cache;
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: Stats = raw
        ? { ...EMPTY_STATS, ...(JSON.parse(raw) as Partial<Stats>) }
        : { ...EMPTY_STATS };
      this.cache = parsed;
      this.inflight = null;
      return parsed;
    })();
    return this.inflight;
  }
}

export const statsService = new StatsService();
