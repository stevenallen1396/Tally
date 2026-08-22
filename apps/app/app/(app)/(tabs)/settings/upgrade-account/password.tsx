import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useAccountSetupStore } from "@/stores/accountSetupStore";

const MIN_PASSWORD_LENGTH = 6;

export default function UpgradeAccountPassword() {
  const storedPassword = useAccountSetupStore((state) => state.password);
  const setPassword = useAccountSetupStore((state) => state.setPassword);
  const [password, setLocalPassword] = useState(storedPassword);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setError(null);
    setPassword(password);
    router.push("/(app)/(tabs)/settings/upgrade-account/display-name");
  };

  return (
    <Screen>
      <View style={{ gap: 16, marginTop: 12 }}>
        <ThemedText preset="body" color="secondary">
          Choose a password for signing back in later.
        </ThemedText>
        <TextField label="Password" value={password} onChangeText={setLocalPassword} secureTextEntry />
        {error ? (
          <ThemedText preset="body" color="debit">
            {error}
          </ThemedText>
        ) : null}
        <Button label="Continue" onPress={handleContinue} disabled={!password} />
      </View>
    </Screen>
  );
}
