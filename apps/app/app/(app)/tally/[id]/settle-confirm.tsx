import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 4): shown to the non-initiator when a `settlements` row is
// pending. Confirm -> status='confirmed' (trigger nets the balance to zero
// via a reconciling entry). Decline -> status='declined', no balance change.
export default function SettleConfirm() {
  const { id: _id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">Confirm settlement</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          Georgia says you&apos;re settled up. Do you agree?
        </ThemedText>
      </View>
      <View style={{ gap: 10 }}>
        <Button label="Confirm, we're settled" onPress={() => {}} />
        <Button label="Decline" variant="secondary" onPress={() => {}} />
      </View>
    </Screen>
  );
}
