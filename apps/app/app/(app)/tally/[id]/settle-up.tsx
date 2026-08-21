import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";

export default function SettleUp() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropose = async () => {
    setError(null);
    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("propose_settlement", { p_tally_id: id });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.back();
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">Settle up?</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          This marks the balance as settled once the other person confirms. It won&apos;t move any
          money — just resets the tally to zero.
        </ThemedText>
      </View>
      {error ? (
        <ThemedText preset="body" color="debit" style={{ textAlign: "center", marginBottom: 12 }}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label={submitting ? "Proposing…" : "Propose settlement"}
        onPress={handlePropose}
        disabled={submitting}
      />
    </Screen>
  );
}
