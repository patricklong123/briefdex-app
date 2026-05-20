import { useEffect, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  Preferences,
  preferencesService,
} from '../services/preferencesService';

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  useEffect(() => preferencesService.subscribe(setPrefs), []);
  return {
    prefs,
    update: (patch: Partial<Preferences>) => preferencesService.update(patch),
  };
}
