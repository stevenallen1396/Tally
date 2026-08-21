import { useTheme } from "./ThemeProvider";

/** Shared header styling for every Stack navigator, so headers match the
 * app's theme (cream/dark surface, Manrope, our colors) instead of the
 * default system look. Spread into `screenOptions`. */
export function useStackHeaderOptions() {
  const { colors, typography } = useTheme();

  return {
    headerStyle: { backgroundColor: colors.surface },
    headerShadowVisible: false,
    headerTintColor: colors.accentPrimary,
    headerTitleStyle: {
      fontFamily: typography.heading.section.fontFamily,
      fontSize: typography.heading.section.fontSize,
      color: colors.textPrimary,
    },
  } as const;
}
