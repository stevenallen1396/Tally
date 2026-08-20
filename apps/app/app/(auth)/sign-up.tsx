import { Link, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // TODO(phase 2): wire up supabase.auth.signUp and route to create-profile on success.
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
        <Button label="Create account" onPress={() => {}} />
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
