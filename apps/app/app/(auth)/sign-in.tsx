import { Link, router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function SignIn() {
  const { session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);

    // Signing in swaps to a brand new session — capture the outgoing guest
    // session's token first so any tallies started before signing in can be
    // pulled across afterward, instead of being silently orphaned.
    const guestAccessToken = session?.user.is_anonymous ? session.access_token : null;

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setSubmitting(false);
      setError(signInError.message);
      return;
    }

    if (guestAccessToken) {
      await supabase.functions.invoke("merge-guest-account", {
        body: { guest_access_token: guestAccessToken },
      });
    }

    setSubmitting(false);
    router.replace("/");
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "" }} />
      <View style={{ gap: 16, marginTop: 12 }}>
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
          label={submitting ? "Signing in…" : "Sign in"}
          onPress={handleSignIn}
          disabled={submitting || !email || !password}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Link href="/(auth)/sign-up" asChild>
        <Button label="New here? Create an account" variant="ghost" style={{ borderWidth: 0 }} />
      </Link>
    </Screen>
  );
}
