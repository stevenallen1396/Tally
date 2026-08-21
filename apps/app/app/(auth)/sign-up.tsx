import * as Linking from "expo-linking";
import { Link, router, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: Linking.createURL("/") },
    });
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required before a session is issued.
      setCheckEmail(true);
      return;
    }
    router.replace("/(auth)/create-profile");
  };

  if (checkEmail) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: true, title: "Create account" }} />
        <View style={{ flex: 1, justifyContent: "center", gap: 8 }}>
          <ThemedText preset="headingScreen">Check your email</ThemedText>
          <ThemedText preset="body" color="secondary">
            We sent a confirmation link to {email}. Open it, then come back and sign in.
          </ThemedText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Create account" }} />
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
          label={submitting ? "Creating account…" : "Create account"}
          onPress={handleSignUp}
          disabled={submitting || !email || !password}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Link href="/(auth)/sign-in" asChild>
        <Button
          label="Already have an account? Sign in"
          variant="ghost"
          style={{ borderWidth: 0 }}
        />
      </Link>
      <ThemedText preset="ledgerMeta" color="secondary" style={{ textAlign: "center" }}>
        v1 supports GBP only for now.
      </ThemedText>
    </Screen>
  );
}
