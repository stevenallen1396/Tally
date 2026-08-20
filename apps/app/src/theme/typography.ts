// Font files are loaded via @expo-google-fonts in app/_layout.tsx.
// Genty (Folio's display script) is not a Google Font — it's loaded locally
// from assets/fonts/Genty.ttf if/when the licensed file is sourced from the
// Folio brand kit. Until then display.hero falls back to Manrope ExtraBold.

export const fontFamilies = {
  manropeRegular: "Manrope_400Regular",
  manropeMedium: "Manrope_500Medium",
  manropeSemiBold: "Manrope_600SemiBold",
  manropeBold: "Manrope_700Bold",
  manropeExtraBold: "Manrope_800ExtraBold",
  spaceMonoRegular: "SpaceMono_400Regular",
  spaceMonoBold: "SpaceMono_700Bold",
  genty: "Genty", // registered only if the local asset is present
} as const;

export const typography = {
  display: {
    hero: { fontFamily: fontFamilies.manropeExtraBold, fontSize: 40, lineHeight: 46 },
  },
  heading: {
    screen: { fontFamily: fontFamilies.manropeBold, fontSize: 24, lineHeight: 30 },
    section: { fontFamily: fontFamilies.manropeSemiBold, fontSize: 17, lineHeight: 22 },
  },
  body: {
    regular: { fontFamily: fontFamilies.manropeRegular, fontSize: 15, lineHeight: 22 },
    emphasis: { fontFamily: fontFamilies.manropeSemiBold, fontSize: 15, lineHeight: 22 },
  },
  label: {
    default: {
      fontFamily: fontFamilies.manropeMedium,
      fontSize: 13,
      lineHeight: 16,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
  },
  ledger: {
    balance: { fontFamily: fontFamilies.spaceMonoBold, fontSize: 32, lineHeight: 36 },
    amount: { fontFamily: fontFamilies.spaceMonoRegular, fontSize: 17, lineHeight: 22 },
    meta: { fontFamily: fontFamilies.spaceMonoRegular, fontSize: 12, lineHeight: 16 },
  },
} as const;
