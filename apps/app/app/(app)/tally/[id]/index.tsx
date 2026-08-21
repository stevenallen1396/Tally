import { formatAbsGBP } from "@tally/shared";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, View } from "react-native";

import { Button } from "@/components/Button";
import { EntryRow } from "@/components/EntryRow";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { useTallyDetail } from "@/hooks/useTallyDetail";
import { useTheme } from "@/theme/ThemeProvider";

export default function TallyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { partnerName, entries, balanceMinor, loading } = useTallyDetail(id);

  const isCredit = balanceMinor >= 0;

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ padding: 20, alignItems: "center", gap: 6 }}>
        <ThemedText preset="label" color="secondary">
          {partnerName || (loading ? "…" : "")}
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
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
        ListEmptyComponent={
          loading ? null : (
            <View style={{ paddingTop: 40, alignItems: "center" }}>
              <ThemedText preset="body" color="secondary">
                No entries yet.
              </ThemedText>
            </View>
          )
        }
        renderItem={({ item }) => (
          <EntryRow data={item} onPress={() => router.push(`/(app)/tally/${id}/entry/${item.id}`)} />
        )}
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
