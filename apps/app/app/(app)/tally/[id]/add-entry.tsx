import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useTallyPartner } from "@/hooks/useTallyPartner";
import { useSession } from "@/lib/SessionProvider";
import { goBackOrReplace } from "@/lib/navigation";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

type Direction = "i_owe" | "they_owe";

// AI-assisted entry logging lives only in the dashboard's Ask Talli AI chat
// — this screen is manual entry only.
export default function AddEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { session } = useSession();
  const { partnerId, partnerName, awaitingPartner } = useTallyPartner(id);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<Direction>("they_owe");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = async () => {
    if (!session) return;
    const amountMinor = Math.round(Number(amount) * 100);
    if (!amountMinor || amountMinor <= 0) return;

    setError(null);
    setSubmitting(true);
    const { error: insertError } = await supabase.from("entries").insert({
      tally_id: id,
      debtor_id: direction === "i_owe" ? session.user.id : partnerId,
      creditor_id: direction === "i_owe" ? partnerId : session.user.id,
      amount_minor: amountMinor,
      note: note.trim() || null,
      source: "manual",
      created_by: session.user.id,
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    goBackOrReplace(`/(app)/tally/${id}`);
  };

  return (
    <Screen>
      <Stack.Screen
        options={{ headerLeft: () => <SmartBackButton fallbackHref={`/(app)/tally/${id}`} /> }}
      />
      {awaitingPartner ? (
        <ThemedText preset="ledgerMeta" color="secondary" style={{ marginBottom: 16 }}>
          {partnerName} hasn&apos;t joined yet — this entry will show up for them as soon as they
          do.
        </ThemedText>
      ) : null}

      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            onPress={() => setDirection("they_owe")}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 12,
              borderColor: colors.border,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: direction === "they_owe" ? colors.creditBg : colors.surface,
            }}
          >
            <ThemedText preset="bodyEmphasis" color={direction === "they_owe" ? "credit" : "primary"}>
              They owe me
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setDirection("i_owe")}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 12,
              borderColor: colors.border,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: direction === "i_owe" ? colors.debitBg : colors.surface,
            }}
          >
            <ThemedText preset="bodyEmphasis" color={direction === "i_owe" ? "debit" : "primary"}>
              I owe them
            </ThemedText>
          </Pressable>
        </View>
        <TextField
          label="Amount (£)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TextField label="What for?" value={note} onChangeText={setNote} />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label={submitting ? "Adding…" : "Add entry"}
          onPress={handleManualSubmit}
          disabled={submitting || !Number(amount)}
        />
      </View>
    </Screen>
  );
}
