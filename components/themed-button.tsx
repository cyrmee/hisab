import React from 'react';
import { Pressable, Text, Platform, ViewStyle, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Spacing, Typography, Shadow, Animation } from '@/constants/tokens';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export function ThemedButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  style
}: ThemedButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size variations
    const sizeStyles = {
      small: {
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
        paddingHorizontal: Spacing.md,
        minHeight: Platform.OS === 'ios' ? 32 : 36,
      },
      medium: {
        paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
        paddingHorizontal: Spacing.lg,
        minHeight: Platform.OS === 'ios' ? 44 : 48,
      },
      large: {
        paddingVertical: Platform.OS === 'ios' ? Spacing.lg : Spacing.xl,
        paddingHorizontal: Spacing.xl,
        minHeight: Platform.OS === 'ios' ? 52 : 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: disabled ? colors.textTertiary : colors.primary,
        ...Platform.select({
          ios: Shadow.sm,
          android: { elevation: disabled ? 0 : 2 },
        }),
      },
      secondary: {
        backgroundColor: disabled ? colors.backgroundSecondary : colors.surface,
        borderWidth: Platform.OS === 'ios' ? 1 : 2,
        borderColor: disabled ? colors.borderSecondary : colors.border,
        ...Platform.select({
          ios: {},
          android: { elevation: disabled ? 0 : 1 },
        }),
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: Platform.OS === 'ios' ? 1 : 2,
        borderColor: disabled ? colors.borderSecondary : colors.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeTextStyles = {
      small: {
        fontSize: Typography.size.caption,
        fontWeight: Typography.weight.medium,
      },
      medium: {
        fontSize: Typography.size.body,
        fontWeight: Typography.weight.semibold,
      },
      large: {
        fontSize: Typography.size.bodyLarge,
        fontWeight: Typography.weight.semibold,
      },
    };

    const variantTextStyles = {
      primary: {
        color: disabled ? colors.textSecondary : colors.textInverse,
      },
      secondary: {
        color: disabled ? colors.textSecondary : colors.text,
      },
      outline: {
        color: disabled ? colors.textSecondary : colors.primary,
      },
    };

    return {
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      lineHeight: sizeTextStyles[size].fontSize * Typography.lineHeight.normal,
    };
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && {
          transform: [{ scale: Animation.scale.press }],
          opacity: Platform.OS === 'ios' ? 0.8 : 0.9,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{
        color: variant === 'primary' ? colors.primaryLight : colors.backgroundSecondary,
        borderless: false,
      }}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </Pressable>
  );
}