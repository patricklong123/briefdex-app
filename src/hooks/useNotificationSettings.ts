import { useEffect, useState } from 'react';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NotificationSettings,
  notificationsService,
} from '../services/notificationsService';

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => notificationsService.subscribe(setSettings), []);

  return {
    settings,
    update: (patch: Partial<NotificationSettings>) => notificationsService.update(patch),
  };
}
