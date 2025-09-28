import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@hisab_theme';

export function useColorScheme(): 'light' | 'dark' | null {
  const systemColorScheme = useSystemColorScheme();
  const [storedTheme, setStoredTheme] = useState<'light' | 'dark' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const theme = await AsyncStorage.getItem(THEME_KEY);
        setStoredTheme(theme as 'light' | 'dark' | null);
      } catch (error) {
        console.error('Error loading stored theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredTheme();
  }, []);

  // Return stored theme if available, otherwise default to light
  if (isLoading) return 'light'; // Default while loading
  return storedTheme || 'light'; // Always default to light, no system follow
}
