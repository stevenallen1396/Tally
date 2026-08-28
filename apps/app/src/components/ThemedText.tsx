import { Text, type TextProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

type Role =
  | "displayHero"
  | "headingWordmark"
  | "headingScreen"
  | "headingSection"
  | "body"
  | "bodyEmphasis"
  | "label"
  | "ledgerBalance"
  | "ledgerAmount"
  | "ledgerMeta";

type ThemedTextProps = TextProps & {
  preset?: Role;
  color?: "primary" | "secondary" | "credit" | "debit";
};

const roleStyles = (typography: ReturnType<typeof useTheme>["typography"]) => ({
  displayHero: typography.display.hero,
  headingWordmark: typography.heading.wordmark,
  headingScreen: typography.heading.screen,
  headingSection: typography.heading.section,
  body: typography.body.regular,
  bodyEmphasis: typography.body.emphasis,
  label: typography.label.default,
  ledgerBalance: typography.ledger.balance,
  ledgerAmount: typography.ledger.amount,
  ledgerMeta: typography.ledger.meta,
});

export function ThemedText({ preset = "body", color = "primary", style, ...rest }: ThemedTextProps) {
  const { colors, typography } = useTheme();
  const styles = roleStyles(typography);

  const colorValue =
    color === "primary"
      ? colors.textPrimary
      : color === "secondary"
        ? colors.textSecondary
        : color === "credit"
          ? colors.credit
          : colors.debit;

  return <Text style={[styles[preset], { color: colorValue }, style]} {...rest} />;
}
