import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 5): list `notifications` rows for the current user, mark read on open.
export default function Notifications() {
  return (
    <Screen>
      <ThemedText preset="headingScreen">Notifications</ThemedText>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText preset="body" color="secondary">
          You&apos;re all caught up.
        </ThemedText>
      </View>
    </Screen>
  );
}
