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
