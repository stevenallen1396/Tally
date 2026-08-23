import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useProfile } from "@/hooks/useProfile";
import { functionErrorMessage } from "@/lib/functionError";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function InviteToken() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();
  const needsYourName = !profileLoading && (!profile || profile.display_name === "Guest");
  const [yourName, setYourName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setError(null);
    setJoining(true);

    let activeSession = session;
    if (!activeSession) {
      const { data, error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError || !data.session) {
        setJoining(false);
        setError(anonError?.message ?? "Couldn't start a session");
        return;
      }
      activeSession = data.session;
    }

    const { data, error: acceptError } = await supabase.functions.invoke<{ tally_id: string }>(
      "accept-invite",
      { body: { token, display_name: needsYourName ? yourName.trim() : undefined } },
    );
    setJoining(false);

    if (acceptError || !data) {
      setError(await functionErrorMessage(acceptError, "Couldn't join this tally"));
      return;
    }

    router.replace(`/(app)/tally/${data.tally_id}`);
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">You&apos;ve been invited to a tally</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          No account needed — you can view and add entries right away, and save your account
          later if you want.
        </ThemedText>
        {needsYourName ? (
          <View style={{ width: "100%", marginTop: 8 }}>
            <TextField label="Your name" value={yourName} onChangeText={setYourName} />
          </View>
        ) : null}
      </View>
      {error ? (
        <ThemedText preset="body" color="debit" style={{ textAlign: "center", marginBottom: 12 }}>
          {error}
        </ThemedText>
      ) : null}
      <Button
        label={joining ? "Joining…" : "Join tally"}
        onPress={handleJoin}
        disabled={joining || sessionLoading || (needsYourName && !yourName.trim())}
      />
    </Screen>
  );
}
