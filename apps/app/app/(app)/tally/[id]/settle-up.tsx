import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 4): insert a `settlements` row (status='pending') for the
// current outstanding balance. Confirming is a separate action the OTHER
// party takes on settle-confirm.tsx — this screen only proposes it.
export default function SettleUp() {
  const { id: _id } = useLocalSearchParams<{ id: string }>();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">Settle up?</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          This marks the balance as settled once the other person confirms. It won&apos;t move any
          money — just resets the tally to zero.
        </ThemedText>
      </View>
      <Button label="Propose settlement" onPress={() => {}} />
    </Screen>
  );
}
