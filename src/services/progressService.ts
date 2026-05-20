import AsyncStorage from '@react-native-async-storage/async-storage';
import { statsService } from './statsService';

export interface ProgressEntry {
  positionSeconds: number;
  durationSeconds: number;
  percentComplete: number;
  complete: boolean;
  updatedAt: number;
}

export const EMPTY_PROGRESS: ProgressEntry = {
  positionSeconds: 0,
  durationSeconds: 0,
  percentComplete: 0,
  complete: false,
  updatedAt: 0,
};

const COMPLETE_THRESHOLD = 0.98;

type Listener = (entry: ProgressEntry) => void;

function storageKey(channel: string, date: string): string {
  return `@briefdex/progress/${channel}/${date}`;
}

function mapKey(channel: string, date: string): string {
  return `${channel}:${date}`;
}

class ProgressService {
  private cache = new Map<string, ProgressEntry>();
  private inflight = new Map<string, Promise<ProgressEntry>>();
  private listeners = new Map<string, Set<Listener>>();

  async getProgress(channel: string, date: string): Promise<ProgressEntry> {
    const k = mapKey(channel, date);
    const cached = this.cache.get(k);
    if (cached) return cached;
    const pending = this.inflight.get(k);
    if (pending) return pending;
    const p = (async () => {
      const raw = await AsyncStorage.getItem(storageKey(channel, date));
      const entry: ProgressEntry = raw ? JSON.parse(raw) : EMPTY_PROGRESS;
      this.cache.set(k, entry);
      this.inflight.delete(k);
      return entry;
    })();
    this.inflight.set(k, p);
    return p;
  }

  getCached(channel: string, date: string): ProgressEntry | null {
    return this.cache.get(mapKey(channel, date)) ?? null;
  }

  async saveProgress(
    channel: string,
    date: string,
    positionSeconds: number,
    durationSeconds: number,
  ): Promise<void> {
    const safePos = Math.max(0, positionSeconds);
    const safeDur = Math.max(0, durationSeconds);
    const percent = safeDur > 0 ? Math.min(1, safePos / safeDur) : 0;
    const existing = await this.getProgress(channel, date);
    const entry: ProgressEntry = {
      positionSeconds: safePos,
      durationSeconds: safeDur,
      percentComplete: percent,
      complete: existing.complete || percent >= COMPLETE_THRESHOLD,
      updatedAt: Date.now(),
    };
    await this.persist(channel, date, entry);
  }

  async markComplete(channel: string, date: string): Promise<void> {
    const existing = await this.getProgress(channel, date);
    const dur = existing.durationSeconds || existing.positionSeconds;
    const entry: ProgressEntry = {
      positionSeconds: dur,
      durationSeconds: dur,
      percentComplete: 1,
      complete: true,
      updatedAt: Date.now(),
    };
    await this.persist(channel, date, entry);
  }

  subscribe(channel: string, date: string, listener: Listener): () => void {
    const k = mapKey(channel, date);
    let set = this.listeners.get(k);
    if (!set) {
      set = new Set();
      this.listeners.set(k, set);
    }
    set.add(listener);
    return () => {
      const s = this.listeners.get(k);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) this.listeners.delete(k);
    };
  }

  private async persist(channel: string, date: string, entry: ProgressEntry): Promise<void> {
    const k = mapKey(channel, date);
    const wasComplete = this.cache.get(k)?.complete ?? false;
    this.cache.set(k, entry);
    this.listeners.get(k)?.forEach((l) => l(entry));
    await AsyncStorage.setItem(storageKey(channel, date), JSON.stringify(entry));
    if (!wasComplete && entry.complete) {
      statsService.recordCompletion(entry.durationSeconds);
    }
  }
}

export const progressService = new ProgressService();
