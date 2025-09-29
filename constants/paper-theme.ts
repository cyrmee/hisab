import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from './tokens';

// Map our internal token names to Paper's MD3 theme structure
function buildTheme(base: any, scheme: 'light' | 'dark') {
  const palette = Colors[scheme];
  return {
    ...base,
    roundness: 12,
    colors: {
      ...base.colors,
      primary: palette.primary,
      secondary: palette.secondary,
      background: palette.background,
      surface: palette.surface,
      surfaceVariant: palette.backgroundSecondary,
      outline: palette.border,
      outlineVariant: palette.borderSecondary,
      error: palette.error,
      onPrimary: palette.textInverse,
      onSecondary: palette.textInverse,
      onSurface: palette.text,
      onSurfaceVariant: palette.textSecondary,
      // Additional MD3 slots we can safely map
      inverseOnSurface: palette.textInverse,
      inverseSurface: palette.text,
      tertiary: palette.info,
    },
  };
}

export const lightPaperTheme = buildTheme(MD3LightTheme as any, 'light');
export const darkPaperTheme = buildTheme(MD3DarkTheme as any, 'dark');

export function usePaperTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkPaperTheme : lightPaperTheme;
}
