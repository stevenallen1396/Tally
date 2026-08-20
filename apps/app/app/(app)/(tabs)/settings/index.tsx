import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 2/3): read `is_anonymous` off the session to decide whether to
// show the guest banner below; wire sign-out to supabase.auth.signOut().
const IS_GUEST = false;

export default function SettingsIndex() {
  const router = useRouter();

  return (
    <Screen style={{ gap: 12 }}>
      {IS_GUEST ? (
        <SettingsRow
          label="You're a guest — save your account"
          onPress={() => router.push("/(app)/(tabs)/settings/upgrade-account")}
        />
      ) : null}
      <SettingsRow label="Profile" onPress={() => router.push("/(app)/(tabs)/settings/profile")} />
      <SettingsRow
        label="Notifications"
        onPress={() => router.push("/(app)/(tabs)/settings/notifications")}
      />
      <View style={{ flex: 1 }} />
      <ThemedText preset="ledgerMeta" color="secondary" style={{ textAlign: "center" }}>
        Tally, part of Folio
      </ThemedText>
    </Screen>
  );
}
