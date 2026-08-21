import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";

// Merging an existing account's history into this guest session (when the
// email conflict path below fires) needs a server-side RPC to reassign
// tally_members/entries rows, since there's no client-facing UPDATE policy
// on tally_members. Out of scope for now — the common case (a brand new
// email) is fully handled; the conflict case gets a clear message instead
// of a half-working merge.
export default function UpgradeAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ email, password });
    setSubmitting(false);

    if (updateError) {
      if (updateError.code === "email_exists" || /already registered/i.test(updateError.message)) {
        setError(
          "That email already has an account. Sign in to it separately for now — merging this guest tally into it isn't supported yet.",
        );
        return;
      }
      setError(updateError.message);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
          <ThemedText preset="headingScreen">Check your email</ThemedText>
          <ThemedText preset="body" color="secondary">
            Confirm the link we sent to {email} to finish saving your account.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <ThemedText preset="body" color="secondary">
          Add an email and password to keep this tally accessible from any device.
        </ThemedText>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button
          label={submitting ? "Saving…" : "Save account"}
          onPress={handleSave}
          disabled={submitting || !email || !password}
        />
      </View>
    </Screen>
  );
}
