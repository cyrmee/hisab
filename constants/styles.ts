import { StyleSheet, Platform } from "react-native";
import { BorderRadius, Colors, Shadow, Spacing, Typography } from "./tokens";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const createStyles = (colorScheme?: 'light' | 'dark' | null) => {
  const theme = colorScheme || 'light';
  const colors = Colors[theme];

  return StyleSheet.create({
    // Container styles - centered and balanced
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.lg,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.lg,
    },

    // Modal styles - platform optimized
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: Platform.OS === 'ios' ? 20 : 16,
      borderTopRightRadius: Platform.OS === 'ios' ? 20 : 16,
      marginTop: 0,
      ...Platform.select({
        ios: Shadow.lg,
        android: { elevation: 5 },
      }),
    },
    modalContent: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.lg,
      paddingTop: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
      paddingBottom: Spacing.lg,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.lg,
      paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.md,
      borderBottomWidth: Platform.OS === 'ios' ? StyleSheet.hairlineWidth : 1,
      borderBottomColor: colors.borderSecondary,
    },
    modalHandle: {
      width: Platform.OS === 'ios' ? 36 : 40,
      height: Platform.OS === 'ios' ? 5 : 4,
      backgroundColor: colors.textTertiary,
      borderRadius: Platform.OS === 'ios' ? 3 : 2,
      alignSelf: "center",
      marginTop: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
      marginBottom: Spacing.md,
    },

    // Card styles - platform optimized
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
      ...Platform.select({
        ios: Shadow.sm,
        android: { elevation: 1 },
      }),
    },
    cardElevated: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
      ...Platform.select({
        ios: Shadow.md,
        android: { elevation: 3 },
      }),
    },

    // Button styles - compact with proper touch targets
    buttonPrimary: {
      backgroundColor: colors.primary,
      paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: Platform.OS === 'ios' ? 44 : 48,
      ...Platform.select({
        ios: Shadow.sm,
        android: { elevation: 2 },
      }),
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: Platform.OS === 'ios' ? 1 : 2,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      minHeight: Platform.OS === 'ios' ? 44 : 48,
    },
    buttonFilterCompact: {
      backgroundColor: colors.surface,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: Platform.OS === 'ios' ? 1 : 0,
      borderColor: Platform.OS === 'ios' ? colors.border : 'transparent',
      alignItems: "center",
      justifyContent: "center",
      height: Platform.OS === 'ios' ? 40 : 48,
      width: Platform.OS === 'ios' ? 40 : 48,
      ...Platform.select({
        ios: {},
        android: { elevation: 1 },
      }),
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.semibold,
      lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },
    buttonTextSecondary: {
      color: colors.text,
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.semibold,
      lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },

    // Shadow styles
    shadow: Shadow.sm,

    // Typography styles - compact scale
    heading1: {
      fontSize: Typography.size.h1,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      lineHeight: Typography.size.h1 * Typography.lineHeight.tight,
      marginBottom: Spacing.md,
    },
    heading2: {
      fontSize: Typography.size.h2,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      lineHeight: Typography.size.h2 * Typography.lineHeight.tight,
      marginBottom: Spacing.sm,
    },
    heading3: {
      fontSize: Typography.size.bodyLarge,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      lineHeight: Typography.size.bodyLarge * Typography.lineHeight.normal,
      marginBottom: Spacing.sm,
    },
    bodyLarge: {
      fontSize: Typography.size.bodyLarge,
      fontWeight: Typography.weight.regular,
      color: colors.text,
      lineHeight: Typography.size.bodyLarge * Typography.lineHeight.normal,
    },
    body: {
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.regular,
      color: colors.text,
      lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },
    bodySecondary: {
      fontSize: Typography.size.body,
      fontWeight: Typography.weight.regular,
      color: colors.textSecondary,
      lineHeight: Typography.size.body * Typography.lineHeight.normal,
    },
    caption: {
      fontSize: Typography.size.caption,
      fontWeight: Typography.weight.regular,
      color: colors.textTertiary,
      lineHeight: Typography.size.caption * Typography.lineHeight.normal,
    },

    // Input styles - compact and accessible
    input: {
      backgroundColor: colors.surface,
      borderWidth: Platform.OS === 'ios' ? 1 : 0,
      borderColor: Platform.OS === 'ios' ? colors.border : 'transparent',
      borderRadius: BorderRadius.lg,
      paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
      paddingHorizontal: Spacing.lg,
      fontSize: Typography.size.body,
      color: colors.text,
      minHeight: Platform.OS === 'ios' ? 44 : 56, // Material Design height
      ...Platform.select({
        ios: Shadow.sm,
        android: { elevation: 1 },
      }),
    },
    inputCompact: {
      backgroundColor: colors.surface,
      borderWidth: Platform.OS === 'ios' ? 1 : 0,
      borderColor: Platform.OS === 'ios' ? colors.border : 'transparent',
      borderRadius: BorderRadius.md,
      paddingVertical: Platform.OS === 'ios' ? Spacing.sm + 2 : Spacing.md,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.size.body,
      color: colors.text,
      height: Platform.OS === 'ios' ? 40 : 48,
      ...Platform.select({
        ios: {},
        android: { elevation: 1 },
      }),
    },
    inputFocused: {
      borderColor: colors.primary,
      borderWidth: Platform.OS === 'ios' ? 2 : 0,
      ...Platform.select({
        ios: {
          ...Shadow.md,
        },
        android: {
          elevation: 2,
          backgroundColor: colors.surfaceElevated,
        },
      }),
    },

    // List styles - platform optimized
    listItem: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: Platform.OS === 'ios' ? 44 : 56,
      ...Platform.select({
        ios: Shadow.sm,
        android: { elevation: 1 },
      }),
    },
    listItemCompact: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.lg,
      paddingHorizontal: Spacing.lg,
      marginVertical: Spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: Platform.OS === 'ios' ? 56 : 64,
      ...Platform.select({
        ios: Shadow.sm,
        android: { elevation: 2 },
      }),
    },
    listItemPressed: {
      backgroundColor: colors.backgroundSecondary,
      transform: [{ scale: Platform.OS === 'ios' ? 0.98 : 0.96 }],
      opacity: Platform.OS === 'ios' ? 0.8 : 0.9,
    },

    // Empty state styles - centered
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    emptyStateText: {
      fontSize: Typography.size.bodyLarge,
      fontWeight: Typography.weight.medium,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: Typography.size.bodyLarge * Typography.lineHeight.relaxed,
    },

    // Glass effect styles - subtle
    glassMorphism: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      backdropFilter: "blur(8px)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },

    // Layout utility styles - centered and balanced
    flexRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    flexRowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    flexCenter: {
      alignItems: "center",
      justifyContent: "center",
    },

    // Spacing utilities - compact scale
    marginTopSm: {
      marginTop: Spacing.sm,
    },
    marginTopMd: {
      marginTop: Spacing.md,
    },
    marginBottomSm: {
      marginBottom: Spacing.sm,
    },
    marginBottomMd: {
      marginBottom: Spacing.md,
    },
    paddingHorizontal: {
      paddingHorizontal: Spacing.lg,
    },
    paddingVertical: {
      paddingVertical: Spacing.md,
    },

    // Floating Action Button (FAB) styles - Material Design compliant
    fab: {
      position: "absolute",
      bottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
      right: Spacing.lg,
      backgroundColor: colors.primary,
      width: Platform.OS === 'ios' ? 56 : 56,
      height: Platform.OS === 'ios' ? 56 : 56,
      borderRadius: Platform.OS === 'ios' ? 28 : 28,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      ...Platform.select({
        ios: Shadow.lg,
        android: { elevation: 6 },
      }),
    },
    fabPressed: {
      transform: [{ scale: Platform.OS === 'ios' ? 0.95 : 0.92 }],
      opacity: Platform.OS === 'ios' ? 0.9 : 0.8,
    },

    // Interactive states for micro-interactions
    pressable: {
      borderRadius: BorderRadius.lg,
    },
    pressed: {
      opacity: 0.8,
      transform: [{ scale: 0.98 }],
    },
  });
};
