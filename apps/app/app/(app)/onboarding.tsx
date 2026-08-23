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
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: session.user.id, display_name: name.trim(), primary_currency: currency });
    setSubmitting(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    useOnboardingStore.getState().markCompleted();
    router.replace("/(app)/tally/new");
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
          <CurrencyPicker value={currency} onChange={setCurrency} />
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
