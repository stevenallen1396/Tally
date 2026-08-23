import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { SmartBackButton } from "@/components/SmartBackButton";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";

export default function JoinTally() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const needsYourName = !profileLoading && (!profile || profile.display_name === "Guest");
  const [yourName, setYourName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setError(null);
    setSubmitting(true);

    const { data, error: acceptError } = await supabase.functions.invoke<{ tally_id: string }>("accept-invite", {
      body: { code: code.trim(), display_name: needsYourName ? yourName.trim() : undefined },
    });
    setSubmitting(false);

    if (acceptError || !data) {
      setError(acceptError?.message ?? "Couldn't join that tally");
      return;
    }

    router.replace(`/(app)/tally/${data.tally_id}`);
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerLeft: () => <SmartBackButton fallbackHref="/(app)/tally/new" /> }} />
      <View style={{ gap: 16 }}>
        {needsYourName ? (
          <>
            <ThemedText preset="body" color="secondary">
              What should your buddy call you?
            </ThemedText>
            <TextField label="Your name" value={yourName} onChangeText={setYourName} />
          </>
        ) : null}
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
          label={submitting ? "Joining…" : "Join tally"}
          onPress={handleJoin}
          disabled={submitting || !code.trim() || (needsYourName && !yourName.trim())}
        />
      </View>
    </Screen>
  );
}
