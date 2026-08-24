import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { functionErrorMessage } from "@/lib/functionError";
import { supabase } from "@/lib/supabase";

export default function JoinTally() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setError(null);
    setSubmitting(true);

    const { data, error: acceptError } = await supabase.functions.invoke<{ tally_id: string }>("accept-invite", {
      body: { code: code.trim() },
    });
    setSubmitting(false);

    if (acceptError || !data) {
      setError(await functionErrorMessage(acceptError, "Couldn't join that talli"));
      return;
    }

    // Clears "Start or join a talli" (and this screen) out of the stack
    // first — otherwise the back button from the talli lands you back in
    // the join flow instead of the dashboard.
    router.dismissTo("/(app)/(tabs)/dashboard");
    router.push(`/(app)/tally/${data.tally_id}`);
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => <SmartBackButton fallbackHref="/(app)/tally/new" /> }} />
      <View style={{ gap: 16 }}>
        <ThemedText preset="body" color="secondary">
          Enter the code your buddy shared with you.
        </ThemedText>
        <TextField
          label="Invite code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label={submitting ? "Joining…" : "Join talli"}
          onPress={handleJoin}
          disabled={submitting || !code.trim()}
        />
      </View>
    </Screen>
  );
}
