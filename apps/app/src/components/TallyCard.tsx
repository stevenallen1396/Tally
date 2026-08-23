import { formatAbs } from "@tally/shared";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";

import { Avatar } from "./Avatar";
import { ThemedText } from "./ThemedText";

export type TallyCardData = {
  id: string;
  partnerName: string;
  partnerAvatarUrl: string | null;
  awaitingPartner: boolean;
  closed: boolean;
  currency: string;
  balanceMinor: number; // positive = they owe you (credit), negative = you owe them (debit)
};

export function TallyCard({ data, onPress }: { data: TallyCardData; onPress?: () => void }) {
  const { colors } = useTheme();
  const isEven = data.balanceMinor === 0;
  const isCredit = data.balanceMinor >= 0;
  const balanceColor = data.closed || isEven ? colors.textSecondary : isCredit ? colors.credit : colors.debit;
  const balanceBg = data.closed || isEven ? colors.background : isCredit ? colors.creditBg : colors.debitBg;

  const statusLabel = data.closed
    ? "buddy left · tap to remove"
    : data.awaitingPartner
      ? "waiting to join"
      : isEven
        ? "evens stevens"
        : isCredit
          ? "owes you"
          : "you owe";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: data.closed ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}
    >
      {data.partnerAvatarUrl ? <Avatar uri={data.partnerAvatarUrl} size={40} /> : null}
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText preset="bodyEmphasis" style={{ fontSize: 19, lineHeight: 24 }}>
          {data.partnerName}
        </ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {statusLabel}
        </ThemedText>
      </View>
      <View style={[styles.balancePill, { backgroundColor: balanceBg }]}>
        <ThemedText preset="ledgerAmount" style={{ color: balanceColor }}>
          {formatAbs(data.balanceMinor, data.currency)}
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
