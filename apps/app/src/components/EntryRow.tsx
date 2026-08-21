import { formatMinorGBP } from "@tally/shared";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { ThemedText } from "./ThemedText";

export type EntryRowData = {
  id: string;
  note: string;
  amountMinor: number; // positive = credit to viewer, negative = debit
  createdAt: string; // pre-formatted for now
};

export function EntryRow({ data, onPress }: { data: EntryRowData; onPress?: () => void }) {
  const { colors } = useTheme();
  const isCredit = data.amountMinor >= 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText preset="body">{data.note}</ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {data.createdAt}
        </ThemedText>
      </View>
      <ThemedText preset="ledgerAmount" color={isCredit ? "credit" : "debit"}>
        {formatMinorGBP(data.amountMinor)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
});
