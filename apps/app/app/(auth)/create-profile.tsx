import { router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function CreateProfile() {
  const { session } = useSession();
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!session) return;
    setError(null);
    setSubmitting(true);
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, display_name: displayName.trim() });
    setSubmitting(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    router.replace("/(app)/(tabs)/dashboard");
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Create profile" }} />
      <View style={{ gap: 16, marginTop: 12 }}>
        <ThemedText preset="body" color="secondary">
          This is the name your buddies will see.
        </ThemedText>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label={submitting ? "Saving…" : "Continue"}
          onPress={handleContinue}
          disabled={submitting || !displayName.trim()}
        />
      </View>
    </Screen>
  );
}
