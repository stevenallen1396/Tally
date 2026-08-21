import { Link } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

export default function Welcome() {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
        <ThemedText preset="displayHero">Talli</ThemedText>
        <ThemedText preset="body" color="secondary">
          Keep a running tally of who owes who — no payments, just the record.
        </ThemedText>
      </View>
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <Link href="/(auth)/sign-up" asChild>
          <Button label="Create account" variant="primary" />
        </Link>
        <Link href="/(auth)/sign-in" asChild>
          <Button label="Sign in" variant="secondary" />
        </Link>
        <ThemedText preset="ledgerMeta" color="secondary" style={{ textAlign: "center", marginTop: 8 }}>
          Got an invite link from a friend? Open it to join their tally instantly — no account
          needed.
        </ThemedText>
      </View>
    </Screen>
  );
}
