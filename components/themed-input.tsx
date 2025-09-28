import React, { useState } from 'react';
import { TextInput, TextInputProps, ViewStyle, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, BorderRadius, Spacing, Typography, Shadow } from '@/constants/tokens';

interface ThemedTextInputProps extends TextInputProps {
  variant?: 'default' | 'compact';
  style?: ViewStyle;
}

export function ThemedTextInput({ 
  variant = 'default', 
  style, 
  onFocus, 
  onBlur, 
  ...props 
}: ThemedTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: variant === 'compact' ? BorderRadius.md : BorderRadius.lg,
      fontSize: Typography.size.body,
      color: colors.text,
      fontFamily: Platform.select({
        ios: 'system',
        android: 'sans-serif',
        default: 'system',
      }),
    };

    const variantStyles = {
      default: {
        borderWidth: Platform.OS === 'ios' ? (isFocused ? 2 : 1) : 0,
        borderColor: Platform.OS === 'ios' 
          ? (isFocused ? colors.primary : colors.border) 
          : 'transparent',
        paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
        paddingHorizontal: Spacing.lg,
        minHeight: Platform.OS === 'ios' ? 44 : 56,
        ...Platform.select({
          ios: isFocused ? Shadow.md : Shadow.sm,
          android: { 
            elevation: isFocused ? 2 : 1,
            backgroundColor: isFocused ? colors.surfaceElevated : colors.surface,
          },
        }),
      },
      compact: {
        borderWidth: Platform.OS === 'ios' ? (isFocused ? 2 : 1) : 0,
        borderColor: Platform.OS === 'ios' 
          ? (isFocused ? colors.primary : colors.border) 
          : 'transparent',
        paddingVertical: Platform.OS === 'ios' ? Spacing.sm + 2 : Spacing.md,
        paddingHorizontal: Spacing.md,
        height: Platform.OS === 'ios' ? 40 : 48,
        ...Platform.select({
          ios: isFocused ? {} : {},
          android: { 
            elevation: isFocused ? 2 : 1,
            backgroundColor: isFocused ? colors.surfaceElevated : colors.surface,
          },
        }),
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <TextInput
      style={[getInputStyle(), style]}
      placeholderTextColor={colors.textTertiary}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}