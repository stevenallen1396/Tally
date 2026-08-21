import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { goBackOrReplace } from "@/lib/navigation";
import { supabase } from "@/lib/supabase";

export default function EditEntry() {
  const { id, entryId } = useLocalSearchParams<{ id: string; entryId: string }>();
  const { session } = useSession();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("entries")
      .select("amount_minor, note, created_by")
      .eq("id", entryId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAmount((data.amount_minor / 100).toString());
          setNote(data.note ?? "");
          setCreatedBy(data.created_by);
        }
        setLoading(false);
      });
  }, [entryId]);

  const isOwner = createdBy === session?.user.id;

  const handleSave = async () => {
    const amountMinor = Math.round(Number(amount) * 100);
    if (!amountMinor || amountMinor <= 0) return;
    setError(null);
    setSubmitting(true);
    const { error: updateError } = await supabase
      .from("entries")
      .update({ amount_minor: amountMinor, note: note.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", entryId);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    goBackOrReplace(`/(app)/tally/${id}`);
  };

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    const { error: deleteError } = await supabase
      .from("entries")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", entryId);
    setSubmitting(false);
    if (deleteError) {
      setError(deleteError.message);
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

  if (!isOwner) {
    return (
      <Screen>
        <Stack.Screen options={{ headerLeft: () => backButton }} />
        <ThemedText preset="body" color="secondary">
          Only whoever logged this entry can edit or delete it.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => backButton }} />
      <View style={{ gap: 16 }}>
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
        <Button label={submitting ? "Saving…" : "Save changes"} onPress={handleSave} disabled={submitting} />
        <Button label="Delete entry" variant="secondary" onPress={handleDelete} disabled={submitting} />
      </View>
    </Screen>
  );
}
