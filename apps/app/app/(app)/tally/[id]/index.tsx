import { formatAbs } from "@tally/shared";
import * as Linking from "expo-linking";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, Share, View } from "react-native";

import { Button } from "@/components/Button";
import { EntryRow } from "@/components/EntryRow";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { ThemedText } from "@/components/ThemedText";
import { useTallyDetail } from "@/hooks/useTallyDetail";
import { useTheme } from "@/theme/ThemeProvider";

export default function TallyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const {
    partnerName,
    awaitingPartner,
    closed,
    currency,
    inviteToken,
    inviteCode,
    entries,
    balanceMinor,
    hasPendingSettlement,
    loading,
  } = useTallyDetail(id);

  const isEven = balanceMinor === 0;
  const isCredit = balanceMinor >= 0;
  const statusLabel = loading
    ? ""
    : closed
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
        <ThemedText preset="label" color="secondary">
          {partnerName || (loading ? "…" : "")}
        </ThemedText>
        <ThemedText
          preset="ledgerBalance"
          color={closed || awaitingPartner || isEven ? "secondary" : isCredit ? "credit" : "debit"}
        >
          {loading
            ? ""
            : `${closed || awaitingPartner || isEven ? "" : isCredit ? "+" : "-"}${formatAbs(balanceMinor, currency)}`}
        </ThemedText>
        <ThemedText preset="ledgerMeta" color="secondary">
          {statusLabel}
        </ThemedText>
      </View>

      {awaitingPartner && inviteToken ? (
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            gap: 12,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <ThemedText preset="bodyEmphasis">Share this link with {partnerName || "them"}</ThemedText>
          <ThemedText preset="ledgerMeta" color="secondary">
            {Linking.createURL(`/invite/${inviteToken}`)}
          </ThemedText>
          <Button
            label="Share link"
            onPress={() => Share.share({ message: Linking.createURL(`/invite/${inviteToken}`) })}
          />
          {inviteCode ? (
            <View style={{ gap: 6, marginTop: 4 }}>
              <ThemedText preset="ledgerMeta" color="secondary">
                Or they can type in this code instead:
              </ThemedText>
              <ThemedText preset="headingSection" style={{ letterSpacing: 1 }}>
                {inviteCode.toUpperCase()}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}

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
