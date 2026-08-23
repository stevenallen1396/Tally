import { useState } from "react";
import { Platform, View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";
import { functionErrorMessage } from "@/lib/functionError";
import { supabase } from "@/lib/supabase";

export default function DeleteAccount() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setSubmitting(true);
    const { error: fnError } = await supabase.functions.invoke("delete-account");

    if (fnError) {
      setSubmitting(false);
      setError(await functionErrorMessage(fnError, "Couldn't delete your account — try again."));
      return;
    }

    await supabase.auth.signOut();
    // Hard reload on web so nothing (e.g. the intro overlay's one-time
    // mount check) reads stale session state from before the sign-out.
    if (Platform.OS === "web") {
      window.location.href = "/";
    } else {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">Delete your account?</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          Any talli with a buddy still on it will close for them, the same as if you&apos;d left it
          — they&apos;ll keep their history, just no longer linked to your account. A talli nobody
          else has joined is deleted outright. This can&apos;t be undone.
        </ThemedText>
      </View>
      {error ? (
        <ThemedText preset="body" color="debit" style={{ textAlign: "center", marginBottom: 12 }}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label={submitting ? "Deleting…" : "Delete my account"}
        onPress={handleDelete}
        disabled={submitting}
        variant="secondary"
      />
    </Screen>
  );
}
