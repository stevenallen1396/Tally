import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { ThemedText } from "@/components/ThemedText";
import { useTallyPartner } from "@/hooks/useTallyPartner";
import { supabase } from "@/lib/supabase";

export default function LeaveTally() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { partnerName, awaitingPartner, closed } = useTallyPartner(id);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const heading = closed ? "Remove this tally?" : awaitingPartner ? "Delete this tally?" : "Leave this tally?";
  const body = closed
    ? `${partnerName} already left — this will permanently delete the tally and its history.`
    : awaitingPartner
      ? "Nobody has joined yet. Deleting it now removes it completely — this can't be undone."
      : `${partnerName} will be notified, and can remove it from their side once you're gone. This can't be undone.`;
  const buttonLabel = closed ? "Remove tally" : awaitingPartner ? "Delete tally" : "Leave tally";

  const handleConfirm = async () => {
    setConfirmVisible(false);
    setError(null);
    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("leave_tally", { p_tally_id: id });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
          <ThemedText preset="headingScreen">{closed || awaitingPartner ? "Tally removed" : "You've left"}</ThemedText>
          <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
            {closed || awaitingPartner
              ? "It's gone for good."
              : `${partnerName} has been notified.`}
          </ThemedText>
        </View>
        <Button label="Back to dashboard" onPress={() => router.replace("/(app)/(tabs)/dashboard")} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => <SmartBackButton fallbackHref={`/(app)/tally/${id}`} /> }} />
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">{heading}</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          {body}
        </ThemedText>
      </View>
      {error ? (
        <ThemedText preset="body" color="debit" style={{ textAlign: "center", marginBottom: 12 }}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label={submitting ? "Removing…" : buttonLabel}
        onPress={() => setConfirmVisible(true)}
        disabled={submitting}
        variant="secondary"
      />
      <ConfirmDialog
        visible={confirmVisible}
        title={heading}
        message={body}
        confirmLabel={buttonLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
      />
    </Screen>
  );
}
