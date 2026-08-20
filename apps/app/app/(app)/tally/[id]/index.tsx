import { formatAbsGBP } from "@tally/shared";
import { Link, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";

import { Button } from "@/components/Button";
import { EntryRow, type EntryRowData } from "@/components/EntryRow";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/ThemeProvider";

// TODO(phase 2): replace with `useTally(id)` + `useEntries(id)`, subscribed
// live via Supabase Realtime on the `entries` table for this tally_id.
const MOCK_ENTRIES: EntryRowData[] = [
  { id: "e1", note: "Curry night", amountMinor: 1250, createdAt: "Yesterday" },
  { id: "e2", note: "Cinema tickets", amountMinor: -800, createdAt: "Last Tuesday" },
  { id: "e3", note: "Petrol", amountMinor: 800, createdAt: "2 weeks ago" },
];

export default function TallyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const balanceMinor = MOCK_ENTRIES.reduce((sum, entry) => sum + entry.amountMinor, 0);
  const isCredit = balanceMinor >= 0;

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ padding: 20, alignItems: "center", gap: 6 }}>
        <ThemedText preset="label" color="secondary">
          Georgia {/* TODO: partner display_name */}
        </ThemedText>
        <ThemedText preset="ledgerBalance" color={isCredit ? "credit" : "debit"}>
          {isCredit ? "+" : "-"}
          {formatAbsGBP(balanceMinor)}
        </ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {isCredit ? "owes you" : "you owe them"}
        </ThemedText>
      </View>

      <FlatList
        data={MOCK_ENTRIES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        renderItem={({ item }) => <EntryRow data={item} />}
      />

      <View style={{ position: "absolute", left: 20, right: 20, bottom: 20, gap: 10 }}>
        <Link href={`/(app)/tally/${id}/add-entry`} asChild>
          <Button label="Add entry" />
        </Link>
        <Link href={`/(app)/tally/${id}/settle-up`} asChild>
          <Button label="Settle up" variant="secondary" />
        </Link>
      </View>
    </Screen>
  );
}
