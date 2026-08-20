import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";

// TODO(phase 2): load/save the current user's `profiles` row.
export default function Profile() {
  const [displayName, setDisplayName] = useState("");

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <TextField label="Display name" value={displayName} onChangeText={setDisplayName} />
        <Button label="Save" onPress={() => {}} />
      </View>
    </Screen>
  );
}
