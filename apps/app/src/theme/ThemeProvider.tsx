import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useColorScheme } from "react-native";

import { useThemeStore } from "@/stores/themeStore";
import { tokens, type ThemeMode, type ThemeTokens } from "./tokens";
import { typography } from "./typography";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeTokens;
  typography: typeof typography;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const preference = useThemeStore((state) => state.preference);

  const mode: ThemeMode =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: tokens[mode], typography }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
