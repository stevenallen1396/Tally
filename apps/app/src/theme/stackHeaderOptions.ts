import { useTheme } from "./ThemeProvider";

/** Shared header styling for every Stack navigator, so headers match the
 * app's theme (Manrope, our colors) instead of the default system look.
 * Uses `colors.background` (not `colors.surface`) so the header blends
 * seamlessly into the screen's content instead of showing as a visibly
 * different-toned bar above it. Spread into `screenOptions`. */
export function useStackHeaderOptions() {
  const { colors, typography } = useTheme();

  return {
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerTintColor: colors.accentPrimary,
    headerTitleStyle: {
      fontFamily: typography.heading.section.fontFamily,
      fontSize: typography.heading.section.fontSize,
      color: colors.textPrimary,
    },
  } as const;
}
