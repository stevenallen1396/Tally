import { useRouter } from "expo-router";
import { View } from "react-native";

import { Screen } from "@/components/Screen";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedText } from "@/components/ThemedText";
import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export default function SettingsIndex() {
  const router = useRouter();
  const { session } = useSession();
  const isGuest = session?.user.is_anonymous ?? false;

  return (
    <Screen style={{ gap: 12 }}>
      {isGuest ? (
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
      <SettingsRow label="Sign out" onPress={() => supabase.auth.signOut()} />
      <View style={{ flex: 1 }} />
      <ThemedText preset="ledgerMeta" color="secondary" style={{ textAlign: "center" }}>
        Tally, part of Folio
      </ThemedText>
    </Screen>
  );
}
