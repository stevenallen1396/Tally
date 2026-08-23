import { formatAbsGBP } from "@tally/shared";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { EntryRow } from "@/components/EntryRow";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { ThemedText } from "@/components/ThemedText";
import { useTallyDetail } from "@/hooks/useTallyDetail";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

export default function TallyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { partnerName, awaitingPartner, closed, entries, balanceMinor, hasPendingSettlement, loading, refetchPartner } =
    useTallyDetail(id);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);

  const startEditingName = () => {
    setNameDraft(partnerName);
    setEditingName(true);
  };

  const saveName = async () => {
    setEditingName(false);
    setSavingName(true);
    await supabase.rpc("set_buddy_nickname", { p_tally_id: id, p_nickname: nameDraft });
    await refetchPartner();
    setSavingName(false);
  };

  const isEven = balanceMinor === 0;
  const isCredit = balanceMinor >= 0;
  const statusLabel = closed
    ? `${partnerName} left this talli`
    : awaitingPartner
      ? "waiting to join"
      : isEven
        ? "evens stevens"
        : isCredit
          ? "owes you"
          : "you owe them";

  return (
    <Screen style={{ padding: 0 }}>
      <Stack.Screen
        options={{
          headerLeft: () => <SmartBackButton fallbackHref="/(app)/(tabs)/dashboard" />,
        }}
      />
      <View style={{ padding: 20, alignItems: "center", gap: 6 }}>
        {editingName ? (
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            onBlur={saveName}
            onSubmitEditing={saveName}
            autoFocus
            selectTextOnFocus
            style={[
              typography.label.default,
              { color: colors.textSecondary, textAlign: "center", minWidth: 120, padding: 0 },
            ]}
          />
        ) : (
          <Pressable onLongPress={startEditingName}>
            <ThemedText preset="label" color="secondary">
              {savingName ? "Saving…" : partnerName || (loading ? "…" : "")}
            </ThemedText>
          </Pressable>
        )}
        <ThemedText
          preset="ledgerBalance"
          color={closed || awaitingPartner || isEven ? "secondary" : isCredit ? "credit" : "debit"}
        >
          {closed || awaitingPartner || isEven ? "" : isCredit ? "+" : "-"}
          {formatAbsGBP(balanceMinor)}
        </ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {statusLabel}
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
        {closed ? null : (
          <>
            <Link href={`/(app)/tally/${id}/add-entry`} asChild>
              <Button label="Add entry" />
            </Link>
            {hasPendingSettlement ? (
              <Link href={`/(app)/tally/${id}/settle-confirm`} asChild>
                <Button label="Settlement pending — review" variant="secondary" />
              </Link>
            ) : (
              <Link href={`/(app)/tally/${id}/settle-up`} asChild>
                <Button label="Settle up" variant="secondary" />
              </Link>
            )}
          </>
        )}
        <Pressable
          onPress={() => router.push(`/(app)/tally/${id}/leave`)}
          style={{ paddingVertical: 4, alignItems: "center" }}
        >
          <ThemedText preset="body" color="secondary" style={{ textDecorationLine: "underline" }}>
            {closed ? "Remove talli" : "Leave talli"}
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}
