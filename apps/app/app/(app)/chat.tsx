import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { ThemedText } from "@/components/ThemedText";
import { functionErrorMessage } from "@/lib/functionError";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/theme/ThemeProvider";

type EntryProposal = {
  tally_id: string;
  amount_minor: number;
  direction: "i_owe" | "they_owe";
  note: string;
  status: "pending" | "confirmed" | "dismissed";
};

type ChatUIMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  entry?: EntryProposal;
};

type ChatReply = {
  intent: "answer" | "add_entry";
  reply: string;
  entry?: Omit<EntryProposal, "status">;
};

let nextId = 0;
function makeId() {
  nextId += 1;
  return `${Date.now()}-${nextId}`;
}

export default function Chat() {
  const { colors } = useTheme();
  const { session } = useSession();
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dictationAvailable, setDictationAvailable] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const listRef = useRef<FlatList<ChatUIMessage>>(null);
  const dictationBaseTextRef = useRef("");

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  useEffect(() => {
    // expo-speech-recognition's native module isn't present in Expo Go —
    // this call throws there rather than just returning false, so the mic
    // button only appears once we know it'll actually work.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- checking a native module's availability is inherently a one-time effect, not derivable state.
      setDictationAvailable(ExpoSpeechRecognitionModule.isRecognitionAvailable());
    } catch {
      setDictationAvailable(false);
    }
  }, []);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    const base = dictationBaseTextRef.current;
    setInput(base ? `${base} ${transcript}` : transcript);
  });

  useSpeechRecognitionEvent("end", () => setRecognizing(false));

  useSpeechRecognitionEvent("error", (event) => {
    setRecognizing(false);
    if (event.error !== "no-speech") {
      setError(event.message || "Couldn't hear that — try again.");
    }
  });

  const handleMicPress = async () => {
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    setError(null);
    const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perms.granted) {
      setError("Talli needs microphone access to hear you.");
      return;
    }
    dictationBaseTextRef.current = input.trim();
    setRecognizing(true);
    ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: true });
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setInput("");
    const userMessage: ChatUIMessage = { id: makeId(), role: "user", text };
    const history = [...messages, userMessage];
    setMessages(history);
    scrollToEnd();
    setSending(true);

    const { data, error: fnError } = await supabase.functions.invoke<ChatReply>("chat", {
      body: { messages: history.map((m) => ({ role: m.role, text: m.text })) },
    });
    setSending(false);

    if (fnError || !data) {
      setError(await functionErrorMessage(fnError, "Something went wrong — try again."));
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: "assistant",
        text: data.reply,
        entry: data.intent === "add_entry" && data.entry ? { ...data.entry, status: "pending" } : undefined,
      },
    ]);
    scrollToEnd();
  };

  const updateEntryStatus = (messageId: string, status: EntryProposal["status"]) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId && m.entry ? { ...m, entry: { ...m.entry, status } } : m)),
    );
  };

  const handleConfirmEntry = async (message: ChatUIMessage) => {
    if (!session || !message.entry) return;
    const { entry } = message;
    const { data: otherMember, error: memberError } = await supabase
      .from("tally_members")
      .select("user_id")
      .eq("tally_id", entry.tally_id)
      .neq("user_id", session.user.id)
      .maybeSingle();

    if (memberError) {
      setError(memberError.message);
      return;
    }

    // otherMember may be null if the buddy hasn't joined that tally yet —
    // the entry still saves with a pending counterparty, backfilled once
    // they join.
    const otherUserId = otherMember?.user_id ?? null;
    const { error: insertError } = await supabase.from("entries").insert({
      tally_id: entry.tally_id,
      debtor_id: entry.direction === "i_owe" ? session.user.id : otherUserId,
      creditor_id: entry.direction === "i_owe" ? otherUserId : session.user.id,
      amount_minor: entry.amount_minor,
      note: entry.note || null,
      source: "nlp",
      created_by: session.user.id,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }
    updateEntryStatus(message.id, "confirmed");
  };

  return (
    <Screen style={{ padding: 0 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Ask Ned",
          headerLeft: () => <SmartBackButton fallbackHref="/(app)/(tabs)/dashboard" />,
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 8 }}>
              <Ionicons name="sparkles" size={28} color={colors.textSecondary} />
              <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
                Ask about a talli&apos;s balance or history, or tell me about an expense to log — e.g.
                &ldquo;How much does Sam owe me?&rdquo; or &ldquo;Sam owes me £8 for coffee&rdquo;.
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                alignSelf: item.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                backgroundColor: item.role === "user" ? colors.accentPrimary : colors.surface,
                borderWidth: item.role === "user" ? 0 : 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 12,
                gap: 10,
              }}
            >
              <ThemedText preset="body" style={item.role === "user" ? { color: "#FFFDF8" } : undefined}>
                {item.text}
              </ThemedText>
              {item.entry ? (
                item.entry.status === "confirmed" ? (
                  <ThemedText preset="ledgerMeta" color="credit">
                    Added ✓
                  </ThemedText>
                ) : item.entry.status === "dismissed" ? (
                  <ThemedText preset="ledgerMeta" color="secondary">
                    Dismissed
                  </ThemedText>
                ) : (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Button label="Confirm" onPress={() => handleConfirmEntry(item)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Button
                        label="Dismiss"
                        variant="secondary"
                        onPress={() => updateEntryStatus(item.id, "dismissed")}
                      />
                    </View>
                  </View>
                )
              ) : null}
            </View>
          )}
        />
        {error ? (
          <ThemedText preset="body" color="debit" style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
            {error}
          </ThemedText>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask or log an expense…"
            placeholderTextColor={colors.textSecondary}
            multiline
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 10,
              maxHeight: 100,
              color: colors.textPrimary,
              backgroundColor: colors.surface,
            }}
          />
          {dictationAvailable ? (
            <Pressable
              onPress={handleMicPress}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: recognizing ? colors.debit : colors.surface,
                borderWidth: recognizing ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name={recognizing ? "stop" : "mic"}
                size={20}
                color={recognizing ? "#FFFDF8" : colors.textPrimary}
              />
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleSend}
            disabled={sending || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentPrimary,
              opacity: sending || !input.trim() ? 0.5 : 1,
            }}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFDF8" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
