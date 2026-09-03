import { CURRENCIES, type CurrencyCode } from "@tally/shared";
import { Pressable, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

export function CurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (currency: CurrencyCode) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}>
      {CURRENCIES.map((currency) => {
        const selected = value === currency.code;
        return (
          <Pressable
            key={currency.code}
            onPress={() => onChange(currency.code)}
            accessibilityLabel={currency.label}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: selected ? colors.accentPrimary : colors.border,
              backgroundColor: selected ? colors.accentPrimary : colors.surface,
            }}
          >
            <ThemedText
              preset="headingScreen"
              style={{ fontSize: 30, lineHeight: 34, color: selected ? "#FFFDF8" : colors.textPrimary }}
            >
              {currency.symbol}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
