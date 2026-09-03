import { CURRENCIES, type CurrencyCode } from "@tally/shared";
import { Pressable, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

export function CurrencyPicker({
  value,
  onChange,
  variant = "pill",
}: {
  value: string;
  onChange: (currency: CurrencyCode) => void;
  variant?: "pill" | "icon";
}) {
  const { colors } = useTheme();

  if (variant === "icon") {
    return (
      <View style={{ flexDirection: "row", gap: 16 }}>
        {CURRENCIES.map((currency) => {
          const selected = value === currency.code;
          return (
            <Pressable
              key={currency.code}
              onPress={() => onChange(currency.code)}
              accessibilityLabel={currency.label}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: selected ? colors.accentSecondary : colors.border,
                backgroundColor: selected ? colors.accentSecondary : colors.surface,
              }}
            >
              <ThemedText
                preset="headingScreen"
                style={{ fontSize: 22, lineHeight: 26, color: selected ? "#FFFDF8" : colors.textPrimary }}
              >
                {currency.symbol}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {CURRENCIES.map((currency) => {
        const selected = value === currency.code;
        return (
          <Pressable
            key={currency.code}
            onPress={() => onChange(currency.code)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: selected ? colors.accentPrimary : colors.surface,
            }}
          >
            <ThemedText preset="bodyEmphasis" style={{ color: selected ? "#FFFDF8" : colors.textPrimary }}>
              {currency.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
