import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";

// TODO(phase 2): load the `entries` row, allow free edit/delete by
// created_by = auth.uid() (enforced server-side via RLS too).
export default function EditEntry() {
  const { id: _id, entryId: _entryId } = useLocalSearchParams<{ id: string; entryId: string }>();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <TextField
          label="Amount (£)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <TextField label="What for?" value={note} onChangeText={setNote} />
        <Button label="Save changes" onPress={() => {}} />
        <Button label="Delete entry" variant="secondary" onPress={() => {}} />
      </View>
    </Screen>
  );
}
