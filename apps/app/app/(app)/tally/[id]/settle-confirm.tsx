import { formatAbs } from "@tally/shared";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { ThemedText } from "@/components/ThemedText";
import { useTallyPartner } from "@/hooks/useTallyPartner";
import { useSession } from "@/lib/SessionProvider";
import { goBackOrReplace } from "@/lib/navigation";
import { supabase } from "@/lib/supabase";

type PendingSettlement = {
  id: string;
  amount_minor: number;
  debtor_id: string | null;
  initiated_by: string | null;
};

export default function SettleConfirm() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useSession();
  const { partnerName, currency } = useTallyPartner(id);
  const [settlement, setSettlement] = useState<PendingSettlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("settlements")
      .select("id, amount_minor, debtor_id, initiated_by")
      .eq("tally_id", id)
      .eq("status", "pending")
      .maybeSingle()
      .then(({ data }) => {
        setSettlement(data);
        setLoading(false);
      });
  }, [id]);

  const isInitiator = settlement?.initiated_by === session?.user.id;

  const respond = async (status: "confirmed" | "declined" | "cancelled") => {
    if (!settlement || !session) return;
    setError(null);
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from("settlements")
      .update({
        status,
        confirmed_by: status === "confirmed" ? session.user.id : null,
        confirmed_at: status === "confirmed" ? new Date().toISOString() : null,
      })
      .eq("id", settlement.id);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    goBackOrReplace(`/(app)/tally/${id}`);
  };

  const backButton = <SmartBackButton fallbackHref={`/(app)/tally/${id}`} />;

  if (loading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerLeft: () => backButton }} />
      </Screen>
    );
  }

  if (!settlement) {
    return (
      <Screen>
        <Stack.Screen options={{ headerLeft: () => backButton }} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText preset="body" color="secondary">
            No settlement is pending on this talli.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  const youAreOwed = settlement.debtor_id !== session?.user.id;

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => backButton }} />
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">
          {isInitiator ? "Settlement proposed" : "Confirm settlement"}
        </ThemedText>
        <ThemedText preset="ledgerBalance" color={youAreOwed ? "credit" : "debit"}>
          {formatAbs(settlement.amount_minor, currency)}
        </ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          {isInitiator
            ? `Waiting for ${partnerName} to confirm you're settled up.`
            : `${partnerName} says you're settled up. Do you agree?`}
        </ThemedText>
      </View>
      {error ? (
        <ThemedText preset="body" color="debit" style={{ textAlign: "center", marginBottom: 12 }}>
          {error}
        </ThemedText>
      ) : null}
      {isInitiator ? (
        <Button
          label="Cancel proposal"
          variant="secondary"
          disabled={submitting}
          onPress={() => respond("cancelled")}
        />
      ) : (
        <View style={{ gap: 10 }}>
          <Button
            label="Confirm, we're settled"
            onPress={() => respond("confirmed")}
            disabled={submitting}
          />
          <Button
            label="Decline"
            variant="secondary"
            onPress={() => respond("declined")}
            disabled={submitting}
          />
        </View>
      )}
    </Screen>
  );
}
