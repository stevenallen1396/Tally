import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

export default function NotFound() {
  return (
    <Screen>
      <Stack.Screen options={{ title: "Not found" }} />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
        <ThemedText preset="headingScreen">This screen doesn&apos;t exist.</ThemedText>
        <Link href="/">
          <ThemedText preset="bodyEmphasis" color="credit">
            Go back home
          </ThemedText>
        </Link>
      </View>
    </Screen>
  );
}
