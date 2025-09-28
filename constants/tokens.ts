// Design tokens for modern compact app styling

export const Colors = {
  light: {
    // Primary brand colors
    primary: '#2563EB',      // Blue 600
    primaryLight: '#3B82F6', // Blue 500
    primaryDark: '#1D4ED8',  // Blue 700
    
    // Secondary colors
    secondary: '#10B981',     // Emerald 500
    secondaryLight: '#34D399',// Emerald 400
    secondaryDark: '#059669', // Emerald 600
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    
    // Text colors
    text: '#0F172A',         // Slate 900
    textSecondary: '#64748B', // Slate 500
    textTertiary: '#94A3B8',  // Slate 400
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E2E8F0',       // Slate 200
    borderSecondary: '#F1F5F9', // Slate 100
    
    // Status colors
    success: '#10B981',      // Emerald 500
    warning: '#F59E0B',      // Amber 500
    error: '#EF4444',        // Red 500
    info: '#3B82F6',         // Blue 500
    
    // Tab bar
    tabActive: '#2563EB',
    tabInactive: '#94A3B8',
    tabBackground: 'rgba(255, 255, 255, 0.95)',
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

// Compact typography scale
export const Typography = {
  size: {
    caption: 12,    // Caption
    body: 14,       // Body (default)
    bodyLarge: 16,  // Body large
    h2: 18,         // H2: 18-20px
    h1: 22,         // H1: 20-24px (using 22 as middle ground)
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,    // Slightly tighter for compact feel
    relaxed: 1.6,
  },
};

// Compact border radius: 8-12px
export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  full: 9999,
};

// Subtle shadows for depth
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
};

// Fast, subtle animations
export const Animation = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 250,    // Max 250ms as per guidelines
  },
  easing: {
    ease: 'ease-out' as const,
    spring: 'ease-in-out' as const,
  },
  scale: {
    press: 0.95,  // Button press scale down
  },
};