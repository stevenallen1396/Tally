import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 3): supabase.auth.updateUser({ email, password }); on the
// email-already-exists error, sign in to the existing account and reassign
// this anonymous user's tally_members/entries rows to it.
export default function UpgradeAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <Button label="Save account" onPress={() => {}} />
      </View>
    </Screen>
  );
}
