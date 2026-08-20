import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
};

export function Button({ label, variant = "primary", style, ...rest }: ButtonProps) {
  const { colors } = useTheme();

  const backgroundColor =
    variant === "primary" ? colors.accentPrimary : variant === "secondary" ? colors.surface : "transparent";
  const textColor = variant === "primary" ? "#FFFDF8" : colors.textPrimary;
  const borderColor = variant === "secondary" ? colors.border : "transparent";

  return (
    <Pressable
      style={(state) => [
        styles.base,
        { backgroundColor, borderColor, opacity: state.pressed ? 0.85 : 1 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...rest}
    >
      <ThemedText preset="bodyEmphasis" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
