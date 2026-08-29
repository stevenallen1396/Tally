// Font files are loaded via @expo-google-fonts in app/_layout.tsx.
// Genty (Folio's display script) is not a Google Font — it's loaded locally
// from assets/fonts/Genty.ttf, registered in app/_layout.tsx's useFonts call.
// Currently a free "Demo" cut of the typeface — fine for building/preview,
// worth a licensing check before shipping to real users.

export const fontFamilies = {
  manropeRegular: "Manrope_400Regular",
  manropeMedium: "Manrope_500Medium",
  manropeSemiBold: "Manrope_600SemiBold",
  manropeBold: "Manrope_700Bold",
  manropeExtraBold: "Manrope_800ExtraBold",
  ibmPlexMonoRegular: "IBMPlexMono_400Regular",
  ibmPlexMonoBold: "IBMPlexMono_700Bold",
  genty: "Genty",
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
    balance: { fontFamily: fontFamilies.ibmPlexMonoBold, fontSize: 32, lineHeight: 36 },
    amount: { fontFamily: fontFamilies.ibmPlexMonoRegular, fontSize: 17, lineHeight: 22 },
    meta: { fontFamily: fontFamilies.ibmPlexMonoRegular, fontSize: 12, lineHeight: 16 },
  },
  // Bespoke to the activity ticker — fixed Warm Charcoal strip / Canvas Cream
  // text regardless of theme, so colors are applied by ActivityTicker itself
  // rather than through ThemedText's theme-aware presets.
  ticker: {
    item: {
      fontFamily: fontFamilies.ibmPlexMonoRegular,
      fontSize: 13,
      lineHeight: 18,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
    },
    amount: { fontFamily: fontFamilies.ibmPlexMonoBold, fontSize: 13, lineHeight: 18 },
  },
} as const;
