import type { PostgrestError } from "@supabase/supabase-js";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/stores/onboardingStore";

// A freshly-created anonymous session can still be settling (token not yet
// fully attached to the client) when this fires, so the very first write
// can race it — the same failure mode useProfile's fetchProfileWithRetry
// already works around on the read side, but this write path never had the
// equivalent guard. Without it, the upsert fails RLS ("new row violates
// row-level security policy") on a mismatched auth.uid(), the profile never
// actually gets saved, and the user is stuck re-entering their name on
// every load. Retry with backoff before giving up.
async function upsertProfileWithRetry(payload: {
  id: string;
  display_name: string;
  primary_currency: string;
}): Promise<PostgrestError | null> {
  let lastError: PostgrestError | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.from("profiles").upsert(payload);
    if (!error) return null;
    lastError = error;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  return lastError;
}

export default function Onboarding() {
  const router = useRouter();
  const { session } = useSession();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!session) return;
    setError(null);
    setSubmitting(true);
    const upsertError = await upsertProfileWithRetry({
      id: session.user.id,
      display_name: name.trim(),
      primary_currency: currency,
    });
    setSubmitting(false);

    if (upsertError) {
      console.error("Failed to save profile during onboarding:", upsertError);
      setError("Something went wrong saving your details — please try again.");
      return;
    }
    useOnboardingStore.getState().markCompleted();
    router.replace("/(app)/(tabs)/dashboard");
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 24 }}>
        <View style={{ gap: 8 }}>
          <ThemedText preset="headingScreen">Welcome to Talli</ThemedText>
          <ThemedText preset="body" color="secondary">
            A couple of things to get set up first.
          </ThemedText>
        </View>
        <View style={{ gap: 16 }}>
          <ThemedText preset="body" color="secondary">
            What is your name?
          </ThemedText>
          <TextField label="Your name" value={name} onChangeText={setName} />
        </View>
        <View style={{ gap: 16 }}>
          <ThemedText preset="body" color="secondary">
            What&apos;s your primary currency? You can pick a different one for each talli later.
          </ThemedText>
          <CurrencyPicker value={currency} onChange={setCurrency} variant="icon" />
        </View>
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
      </View>
      <Button
        label={submitting ? "Saving…" : "Continue"}
        onPress={handleContinue}
        disabled={submitting || !name.trim()}
      />
    </Screen>
  );
}
