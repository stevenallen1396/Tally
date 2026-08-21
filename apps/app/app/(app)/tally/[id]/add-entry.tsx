import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useTallyPartner } from "@/hooks/useTallyPartner";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

type Mode = "chat" | "manual";

// TODO(phase 3): "chat" mode POSTs { tally_id, raw_text } to the `parse-entry`
// edge function, then shows the parsed result here for the user to confirm
// before writing to `entries` — parsing never writes directly. Manual stays
// available even after chat parsing ships — it's the fallback, not a replacement.
export default function AddEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { session } = useSession();
  const { partnerId } = useTallyPartner(id);
  const [mode, setMode] = useState<Mode>("manual");
  const [chatText, setChatText] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<"i_owe" | "they_owe">("they_owe");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEntry = async () => {
    const amountMinor = Math.round(Number(amount) * 100);
    if (!session || !partnerId || !amountMinor || amountMinor <= 0) return;

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
    router.back();
  };

  return (
    <Screen>
      <View style={{ flexDirection: "row", borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 20 }}>
        {(["chat", "manual"] as Mode[]).map((option) => (
          <Pressable
            key={option}
            onPress={() => setMode(option)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: mode === option ? colors.accentPrimary : colors.surface,
            }}
          >
            <ThemedText
              preset="bodyEmphasis"
              style={{ color: mode === option ? "#FFFDF8" : colors.textPrimary }}
            >
              {option === "chat" ? "Chat / dictate" : "Manual"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {mode === "chat" ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="What happened?"
            placeholder="e.g. Georgia owes me £5 for curry"
            value={chatText}
            onChangeText={setChatText}
            multiline
          />
          <ThemedText preset="ledgerMeta" color="secondary">
            Coming soon — for now, use Manual to add an entry.
          </ThemedText>
          <Button label="Continue" onPress={() => {}} disabled />
        </View>
      ) : (
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
            onPress={handleAddEntry}
            disabled={submitting || !partnerId || !Number(amount)}
          />
        </View>
      )}
    </Screen>
  );
}
