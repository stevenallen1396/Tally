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
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: selected ? colors.accentPrimary : colors.border,
              backgroundColor: selected ? colors.accentPrimary : colors.surface,
            }}
          >
            <ThemedText
              preset="headingScreen"
              style={{
                fontSize: 20,
                lineHeight: 24,
                textAlign: "center",
                color: selected ? "#FFFDF8" : colors.textPrimary,
              }}
            >
              {currency.symbol}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
