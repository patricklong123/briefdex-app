import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = '@briefdex/notifications';

const DAILY_BRIEFING_CONTENT = {
  title: '📈 Markets open in 2 hours.',
  body: 'Your morning briefing is ready.',
};
const LISTENING_REMINDER_CONTENT = {
  title: "⏰ Don't start the day behind.",
  body: 'Your Briefdex briefing is waiting.',
};

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
    // Reflect the new settings in the OS scheduler. Requesting permission is
    // allowed here because this path is only reached from an explicit user
    // interaction (toggling/adjusting a reminder).
    await this.applySchedule(next, true);
    return next;
  }

  /**
   * Reconcile the OS-scheduled notifications with the given settings. Existing
   * Briefdex reminders are cleared and re-created from scratch so the schedule
   * is always an exact mirror of the stored settings.
   *
   * @param request when true, prompt for permission if not yet granted. Pass
   *   false on app launch so we never surface a permission dialog unprompted.
   */
  async applySchedule(settings: NotificationSettings, request: boolean): Promise<void> {
    try {
      const wantsAny = settings.dailyBriefing.enabled || settings.listeningReminder.enabled;
      const granted = wantsAny ? await this.ensurePermissions(request) : false;

      await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      if (!granted) return;

      if (settings.dailyBriefing.enabled) {
        await this.scheduleDaily(DAILY_BRIEFING_CONTENT, settings.dailyBriefing.time);
      }
      if (settings.listeningReminder.enabled) {
        await this.scheduleDaily(LISTENING_REMINDER_CONTENT, settings.listeningReminder.time);
      }
    } catch {
      // Never let a scheduling/permission failure bubble up — settings have
      // already been persisted, and the schedule re-syncs on next launch.
    }
  }

  private async scheduleDaily(
    content: { title: string; body: string },
    time: TimeOfDay,
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: { ...content, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
      },
    }).catch(() => {});
  }

  private async ensurePermissions(request: boolean): Promise<boolean> {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!request || !current.canAskAgain) return false;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
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

let handlerConfigured = false;

/**
 * Set up the notification handler + Android channel, then re-apply the stored
 * schedule (without prompting for permission). Call once on app launch.
 */
export async function configureNotifications(): Promise<void> {
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Daily briefings',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => {});
  }

  const settings = await notificationsService.get();
  await notificationsService.applySchedule(settings, false);
}

export function formatTime({ hour, minute }: TimeOfDay): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${period}`;
}
