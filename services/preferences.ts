import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'hisab_pref_';
const KEY_AUTO_BACKUP = KEY_PREFIX + 'autoBackup';
const KEY_ANALYTICS = KEY_PREFIX + 'analyticsEnabled';

export interface Preferences {
  autoBackup: boolean;
  analyticsEnabled: boolean;
}

export async function loadPreferences(): Promise<Preferences> {
  try {
    const [autoBackupRaw, analyticsRaw] = await Promise.all([
      AsyncStorage.getItem(KEY_AUTO_BACKUP),
      AsyncStorage.getItem(KEY_ANALYTICS)
    ]);
    return {
      autoBackup: autoBackupRaw === 'true',
      analyticsEnabled: analyticsRaw === null ? true : analyticsRaw === 'true'
    };
  } catch (e) {
    console.warn('Failed to load preferences, using defaults', e);
    return { autoBackup: false, analyticsEnabled: true };
  }
}

export async function savePreferences(prefs: Partial<Preferences>): Promise<void> {
  const entries: [string, string][] = [];
  if (prefs.autoBackup !== undefined) entries.push([KEY_AUTO_BACKUP, String(prefs.autoBackup)]);
  if (prefs.analyticsEnabled !== undefined) entries.push([KEY_ANALYTICS, String(prefs.analyticsEnabled)]);
  try {
    await AsyncStorage.multiSet(entries);
  } catch (e) {
    console.warn('Failed to save preferences', e);
  }
}
