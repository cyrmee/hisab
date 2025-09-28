// Design tokens for modern compact app styling

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Primary brand colors
    primary: "#2563EB", // Blue 600
    primaryLight: "#3B82F6", // Blue 500
    primaryDark: "#1D4ED8", // Blue 700

    // Secondary colors
    secondary: "#10B981", // Emerald 500
    secondaryLight: "#34D399", // Emerald 400
    secondaryDark: "#059669", // Emerald 600

    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAFC", // Slate 50
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Text colors
    text: "#0F172A", // Slate 900
    textSecondary: "#64748B", // Slate 500
    textTertiary: "#94A3B8", // Slate 400
    textInverse: "#FFFFFF",

    // Border colors
    border: "#E2E8F0", // Slate 200
    borderSecondary: "#F1F5F9", // Slate 100

    // Status colors
    success: "#10B981", // Emerald 500
    warning: "#F59E0B", // Amber 500
    error: "#EF4444", // Red 500
    info: "#3B82F6", // Blue 500

    // Tab bar
    tabActive: "#2563EB",
    tabInactive: "#94A3B8",
    tabBackground: "rgba(255, 255, 255, 0.95)",

    // iOS specific colors
    icon: Platform.OS === 'ios' ? '#007AFF' : '#687076',
  },
  dark: {
    // Primary brand colors - adjusted for dark theme
    primary: "#3B82F6", // Blue 500 (slightly brighter)
    primaryLight: "#60A5FA", // Blue 400
    primaryDark: "#2563EB", // Blue 600

    // Secondary colors
    secondary: "#34D399", // Emerald 400 (brighter)
    secondaryLight: "#6EE7B7", // Emerald 300
    secondaryDark: "#10B981", // Emerald 500

    // Background colors - true dark theme
    background: "#000000", // True black for iOS
    backgroundSecondary: "#1C1C1E", // iOS dark secondary
    surface: "#1C1C1E", // iOS card background
    surfaceElevated: "#2C2C2E", // iOS elevated surface

    // Text colors
    text: "#FFFFFF", // White text
    textSecondary: "#98989D", // iOS secondary text
    textTertiary: "#636366", // iOS tertiary text
    textInverse: "#000000", // Black text on light backgrounds

    // Border colors
    border: "#38383A", // iOS separator
    borderSecondary: "#2C2C2E", // Subtle border

    // Status colors - adjusted for dark
    success: "#34D399", // Emerald 400
    warning: "#FBBF24", // Amber 400
    error: "#F87171", // Red 400
    info: "#60A5FA", // Blue 400

    // Tab bar - iOS dark style
    tabActive: "#3B82F6",
    tabInactive: "#8E8E93",
    tabBackground: "rgba(28, 28, 30, 0.95)",

    // iOS specific colors
    icon: Platform.OS === 'ios' ? '#0A84FF' : '#9BA1A6',
  },
};

// Compact spacing scale: 4, 8, 12, 16, 24
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

// Compact typography scale - platform optimized
export const Typography = {
  size: {
    caption: Platform.OS === 'ios' ? 12 : 11,
    body: Platform.OS === 'ios' ? 14 : 14,
    bodyLarge: Platform.OS === 'ios' ? 16 : 16,
    h2: Platform.OS === 'ios' ? 18 : 20,
    h1: Platform.OS === 'ios' ? 22 : 24,
  },
  weight: {
    regular: Platform.OS === 'ios' ? "400" as const : "normal" as const,
    medium: Platform.OS === 'ios' ? "500" as const : "500" as const,
    semibold: Platform.OS === 'ios' ? "600" as const : "600" as const,
    bold: Platform.OS === 'ios' ? "700" as const : "bold" as const,
  },
  lineHeight: {
    tight: Platform.OS === 'ios' ? 1.2 : 1.1,
    normal: Platform.OS === 'ios' ? 1.4 : 1.3,
    relaxed: Platform.OS === 'ios' ? 1.6 : 1.5,
  },
  fontFamily: Platform.select({
    ios: {
      sans: 'System',
      rounded: '.SF UI Rounded',
      mono: 'Menlo',
    },
    android: {
      sans: 'sans-serif',
      rounded: 'sans-serif',
      mono: 'monospace',
    },
    default: {
      sans: 'system-ui',
      rounded: 'system-ui', 
      mono: 'monospace',
    },
  }),
};

// Compact border radius: platform optimized
export const BorderRadius = {
  sm: Platform.OS === 'ios' ? 8 : 6,
  md: Platform.OS === 'ios' ? 10 : 8,
  lg: Platform.OS === 'ios' ? 12 : 10,
  xl: Platform.OS === 'ios' ? 16 : 12,
  full: 9999,
};

// Subtle shadows for depth - platform optimized
export const Shadow = {
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
  }),
};

// Fast, subtle animations - platform optimized
export const Animation = {
  duration: {
    fast: Platform.OS === 'ios' ? 150 : 120,
    normal: Platform.OS === 'ios' ? 200 : 180,
    slow: Platform.OS === 'ios' ? 250 : 220,
  },
  easing: {
    ease: "ease-out" as const,
    spring: "ease-in-out" as const,
  },
  scale: {
    press: Platform.OS === 'ios' ? 0.95 : 0.92, // Platform-specific press feedback
    tap: Platform.OS === 'ios' ? 0.98 : 0.96,   // Lighter feedback for taps
  },
};
