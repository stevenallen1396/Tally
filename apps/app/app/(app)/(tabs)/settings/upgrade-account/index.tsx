import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useAccountSetupStore } from "@/stores/accountSetupStore";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UpgradeAccountEmail() {
  const storedEmail = useAccountSetupStore((state) => state.email);
  const setEmail = useAccountSetupStore((state) => state.setEmail);
  const [email, setLocalEmail] = useState(storedEmail);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("That doesn't look like a valid email address.");
      return;
    }
    setError(null);
    setEmail(email.trim());
    router.push("/(app)/(tabs)/settings/upgrade-account/password");
  };

  return (
    <Screen>
      <View style={{ gap: 16, marginTop: 12 }}>
        <ThemedText preset="body" color="secondary">
          Add an email and password to keep this tally accessible from any device.
        </ThemedText>
        <TextField
          label="Email"
          value={email}
          onChangeText={setLocalEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button label="Continue" onPress={handleContinue} disabled={!email.trim()} />
      </View>
    </Screen>
  );
}
