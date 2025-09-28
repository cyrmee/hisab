import { StyleSheet } from "react-native";
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

    // Modal styles - Full screen modals
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 16, // Larger radius for iOS feel
      borderTopRightRadius: 16,
      marginTop: 0, // Full screen modal
      ...Shadow.lg, // Add shadow for depth
    },
    modalContent: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.lg,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.lg,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSecondary,
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.textTertiary,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
    },

    // Card styles - compact and balanced
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.sm,
      ...Shadow.sm,
    },
    cardElevated: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.sm,
      ...Shadow.md,
    },

    // Button styles - compact with proper touch targets
    buttonPrimary: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44, // Accessibility minimum
      ...Shadow.sm,
    },
    buttonSecondary: {
      backgroundColor: "transparent",
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44, // Accessibility minimum
    },
    buttonFilterCompact: {
      backgroundColor: colors.surface,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.sm,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      height: 48, // Updated to match inputCompact height
      width: 48, // Adjusted width to maintain square appearance
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
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.size.body,
      color: colors.text,
      minHeight: 44, // Accessibility minimum
    },
    inputCompact: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.size.body,
      color: colors.text,
      height: 48, // Increased height for better cursor visibility
    },
    inputFocused: {
      borderColor: colors.primary,
      ...Shadow.sm,
    },

    // List styles - balanced spacing
    listItem: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginVertical: Spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 44, // Accessibility minimum
      ...Shadow.sm,
    },
    listItemCompact: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      marginVertical: Spacing.xs,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 56, // Slightly larger for better touch experience
      ...Shadow.sm,
    },
    listItemPressed: {
      backgroundColor: colors.backgroundSecondary,
      transform: [{ scale: 0.98 }],
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

    // Floating Action Button (FAB) styles
    fab: {
      position: "absolute",
      bottom: Spacing.xl,
      right: Spacing.lg,
      backgroundColor: colors.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      ...Shadow.lg,
    },
    fabPressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.9,
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
