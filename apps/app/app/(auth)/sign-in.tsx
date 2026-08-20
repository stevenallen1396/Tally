import { Link, Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // TODO(phase 2): wire up supabase.auth.signInWithPassword and route to dashboard on success.
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Sign in" }} />
      <View style={{ gap: 16, marginTop: 12 }}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button label="Sign in" onPress={() => {}} />
      </View>
      <View style={{ flex: 1 }} />
      <Link href="/(auth)/sign-up" asChild>
        <Button label="New here? Create an account" variant="ghost" style={{ borderWidth: 0 }} />
      </Link>
    </Screen>
  );
}
