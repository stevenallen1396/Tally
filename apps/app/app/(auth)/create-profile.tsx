import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { ThemedText } from "@/components/ThemedText";

export default function CreateProfile() {
  const [displayName, setDisplayName] = useState("");

  // TODO(phase 2): write to `profiles` table, then route to dashboard.
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Create profile" }} />
      <View style={{ gap: 16, marginTop: 12 }}>
        <ThemedText preset="body" color="secondary">
          This is the name your tally partners will see.
        </ThemedText>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <Button label="Continue" onPress={() => {}} />
      </View>
    </Screen>
  );
}
