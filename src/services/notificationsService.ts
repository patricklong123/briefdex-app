import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@briefdex/notifications';

export interface TimeOfDay {
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface NotificationSettings {
  dailyBriefing: { enabled: boolean; time: TimeOfDay };
  listeningReminder: { enabled: boolean; time: TimeOfDay };
  weeklySummary: { enabled: boolean };
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyBriefing: { enabled: true, time: { hour: 6, minute: 30 } },
  listeningReminder: { enabled: false, time: { hour: 8, minute: 0 } },
  weeklySummary: { enabled: false },
};

type Listener = (settings: NotificationSettings) => void;

class NotificationsService {
  private cache: NotificationSettings | null = null;
  private inflight: Promise<NotificationSettings> | null = null;
  private listeners = new Set<Listener>();

  async get(): Promise<NotificationSettings> {
    if (this.cache) return this.cache;
    if (this.inflight) return this.inflight;
    this.inflight = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? this.merge(JSON.parse(raw)) : { ...DEFAULT_NOTIFICATION_SETTINGS };
      this.cache = parsed;
      this.inflight = null;
      return parsed;
    })();
    return this.inflight;
  }

  async update(patch: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const current = await this.get();
    const next: NotificationSettings = {
      dailyBriefing: { ...current.dailyBriefing, ...(patch.dailyBriefing ?? {}) },
      listeningReminder: { ...current.listeningReminder, ...(patch.listeningReminder ?? {}) },
      weeklySummary: { ...current.weeklySummary, ...(patch.weeklySummary ?? {}) },
    };
    this.cache = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.listeners.forEach((l) => l(next));
    return next;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.get().then((s) => {
      if (this.listeners.has(listener)) listener(s);
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private merge(raw: Partial<NotificationSettings>): NotificationSettings {
    const d = DEFAULT_NOTIFICATION_SETTINGS;
    return {
      dailyBriefing: { ...d.dailyBriefing, ...(raw.dailyBriefing ?? {}) },
      listeningReminder: { ...d.listeningReminder, ...(raw.listeningReminder ?? {}) },
      weeklySummary: { ...d.weeklySummary, ...(raw.weeklySummary ?? {}) },
    };
  }
}

export const notificationsService = new NotificationsService();

export function formatTime({ hour, minute }: TimeOfDay): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}
