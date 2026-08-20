import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/theme/ThemeProvider";

type Mode = "chat" | "manual";

// TODO(phase 3): "chat" mode POSTs { tally_id, raw_text } to the `parse-entry`
// edge function, then shows the parsed result here for the user to confirm
// before writing to `entries` — parsing never writes directly.
// TODO(phase 2): "manual" mode writes straight to `entries` (amount, direction, note).
// Manual stays available even after chat parsing ships — it's the fallback, not a replacement.
export default function AddEntry() {
  const { id: _id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>("chat");
  const [chatText, setChatText] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<"i_owe" | "they_owe">("they_owe");

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
            Type it, or tap the mic to dictate. We&apos;ll show you what we understood before saving
            anything.
          </ThemedText>
          <Button label="Continue" onPress={() => {}} />
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
          <Button label="Add entry" onPress={() => {}} />
        </View>
      )}
    </Screen>
  );
}
