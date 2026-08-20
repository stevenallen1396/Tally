export const tokens = {
  light: {
    background: "#F4EEDF",
    surface: "#FFFDF8",
    textPrimary: "#2B2926",
    textSecondary: "#6B6862",
    border: "#E4DCC8",
    credit: "#3E4A2B",
    creditBg: "#E4E8DB",
    debit: "#D35230",
    debitBg: "#F7E1DA",
    accentPrimary: "#5D5FEF",
    accentSecondary: "#EBB035",
    accentTertiary: "#EB5EA2",
  },
  dark: {
    background: "#1E1C19",
    surface: "#2B2926",
    textPrimary: "#F4EEDF",
    textSecondary: "#B8AF9C",
    border: "#3A362F",
    credit: "#7C9463",
    creditBg: "#3A4331",
    debit: "#E37A5A",
    debitBg: "#4A2E24",
    accentPrimary: "#7B7DF5",
    accentSecondary: "#EBB035",
    accentTertiary: "#F080B3",
  },
} as const;

export type ThemeMode = keyof typeof tokens;
export type ThemeTokens = (typeof tokens)[ThemeMode];
