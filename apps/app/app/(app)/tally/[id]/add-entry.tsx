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
type Direction = "i_owe" | "they_owe";

type ParsedEntry = {
  amount_minor: number;
  direction: Direction;
  note: string;
  name_mismatch: boolean;
  confidence: "high" | "medium" | "low";
};

// Manual stays available even with chat parsing live — it's the permanent
// fallback, not a placeholder for it. Chat parsing never writes directly:
// parse-entry only returns a structured guess, shown here for confirmation.
export default function AddEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { session } = useSession();
  const { partnerId } = useTallyPartner(id);
  const [mode, setMode] = useState<Mode>("chat");
  const [chatText, setChatText] = useState("");
  const [parsed, setParsed] = useState<ParsedEntry | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<Direction>("they_owe");
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insertEntry = async (params: {
    amountMinor: number;
    direction: Direction;
    note: string;
    source: "manual" | "nlp";
    rawInput?: string;
  }) => {
    if (!session || !partnerId) return;
    setError(null);
    setSubmitting(true);
    const { error: insertError } = await supabase.from("entries").insert({
      tally_id: id,
      debtor_id: params.direction === "i_owe" ? session.user.id : partnerId,
      creditor_id: params.direction === "i_owe" ? partnerId : session.user.id,
      amount_minor: params.amountMinor,
      note: params.note.trim() || null,
      source: params.source,
      raw_input: params.rawInput ?? null,
      created_by: session.user.id,
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.back();
  };

  const handleParse = async () => {
    setError(null);
    setParsing(true);
    const { data, error: parseError } = await supabase.functions.invoke<ParsedEntry>(
      "parse-entry",
      { body: { tally_id: id, raw_text: chatText } },
    );
    setParsing(false);

    if (parseError || !data) {
      setError(parseError?.message ?? "Couldn't understand that — try Manual instead.");
      return;
    }
    setParsed(data);
  };

  const handleConfirmParsed = () => {
    if (!parsed) return;
    insertEntry({
      amountMinor: parsed.amount_minor,
      direction: parsed.direction,
      note: parsed.note,
      source: "nlp",
      rawInput: chatText,
    });
  };

  const handleManualSubmit = () => {
    const amountMinor = Math.round(Number(amount) * 100);
    if (!amountMinor || amountMinor <= 0) return;
    insertEntry({ amountMinor, direction, note, source: "manual" });
  };

  return (
    <Screen>
      <View style={{ flexDirection: "row", borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: 20 }}>
        {(["chat", "manual"] as Mode[]).map((option) => (
          <Pressable
            key={option}
            onPress={() => {
              setMode(option);
              setParsed(null);
              setError(null);
            }}
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
        parsed ? (
          <View style={{ gap: 16 }}>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 12,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 16,
                gap: 8,
              }}
            >
              <ThemedText preset="ledgerBalance" color={parsed.direction === "they_owe" ? "credit" : "debit"}>
                £{(parsed.amount_minor / 100).toFixed(2)}
              </ThemedText>
              <ThemedText preset="body">
                {parsed.direction === "they_owe" ? "They owe you" : "You owe them"} — {parsed.note}
              </ThemedText>
              {parsed.name_mismatch ? (
                <ThemedText preset="ledgerMeta" color="debit">
                  This mentions a name that doesn&apos;t match your tally partner — double-check
                  before confirming.
                </ThemedText>
              ) : null}
              {parsed.confidence === "low" ? (
                <ThemedText preset="ledgerMeta" color="secondary">
                  Not fully confident about this one — check the amount and direction.
                </ThemedText>
              ) : null}
            </View>
            {error ? (
              <ThemedText preset="body" color="debit">
                {error}
              </ThemedText>
            ) : null}
            <Button
              label={submitting ? "Adding…" : "Confirm & add entry"}
              onPress={handleConfirmParsed}
              disabled={submitting}
            />
            <Button label="Try again" variant="secondary" onPress={() => setParsed(null)} />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <TextField
              label="What happened?"
              placeholder="e.g. Georgia owes me £5 for curry"
              value={chatText}
              onChangeText={setChatText}
              multiline
            />
            <ThemedText preset="ledgerMeta" color="secondary">
              Type it, or tap the mic to dictate. We&apos;ll show you what we understood before
              saving anything.
            </ThemedText>
            {error ? (
              <ThemedText preset="body" color="debit">
                {error}
              </ThemedText>
            ) : null}
            <Button
              label={parsing ? "Thinking…" : "Continue"}
              onPress={handleParse}
              disabled={parsing || !chatText.trim() || !partnerId}
            />
          </View>
        )
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
            onPress={handleManualSubmit}
            disabled={submitting || !partnerId || !Number(amount)}
          />
        </View>
      )}
    </Screen>
  );
}
