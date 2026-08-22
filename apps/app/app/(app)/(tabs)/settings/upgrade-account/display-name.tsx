import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";
import { useAccountSetupStore } from "@/stores/accountSetupStore";

export default function UpgradeAccountDisplayName() {
  const storedDisplayName = useAccountSetupStore((state) => state.displayName);
  const setDisplayName = useAccountSetupStore((state) => state.setDisplayName);
  const [displayName, setLocalDisplayName] = useState(storedDisplayName);

  const handleContinue = () => {
    setDisplayName(displayName.trim());
    router.push("/(app)/(tabs)/settings/upgrade-account/profile-picture");
  };

  return (
    <Screen>
      <View style={{ gap: 16, marginTop: 12 }}>
        <ThemedText preset="body" color="secondary">
          This is the name your buddies will see.
        </ThemedText>
        <TextField label="Display name" value={displayName} onChangeText={setLocalDisplayName} />
        <Button label="Continue" onPress={handleContinue} disabled={!displayName.trim()} />
      </View>
    </Screen>
  );
}
