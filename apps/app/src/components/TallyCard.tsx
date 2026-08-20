import { formatAbsGBP } from "@tally/shared";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

export type TallyCardData = {
  id: string;
  partnerName: string;
  balanceMinor: number; // positive = they owe you (credit), negative = you owe them (debit)
};

export function TallyCard({ data, onPress }: { data: TallyCardData; onPress?: () => void }) {
  const { colors } = useTheme();
  const isCredit = data.balanceMinor >= 0;
  const balanceColor = isCredit ? colors.credit : colors.debit;
  const balanceBg = isCredit ? colors.creditBg : colors.debitBg;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText preset="bodyEmphasis">{data.partnerName}</ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {isCredit ? "owes you" : "you owe"}
        </ThemedText>
      </View>
      <View style={[styles.balancePill, { backgroundColor: balanceBg }]}>
        <ThemedText preset="ledgerAmount" style={{ color: balanceColor }}>
          {formatAbsGBP(data.balanceMinor)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  balancePill: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
