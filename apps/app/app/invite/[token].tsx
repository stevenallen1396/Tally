import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { ThemedText } from "@/components/ThemedText";

// TODO(phase 3): on mount, if there's no session call supabase.auth.signInAnonymously(),
// then POST { token } to the `accept-invite` edge function. On success, redirect
// to /(app)/tally/[id]. This route must work logged-out, on native or web, with
// zero app install required.
export default function InviteToken() {
  const { token: _token } = useLocalSearchParams<{ token: string }>();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", gap: 12, alignItems: "center" }}>
        <ThemedText preset="headingScreen">You&apos;ve been invited to a tally</ThemedText>
        <ThemedText preset="body" color="secondary" style={{ textAlign: "center" }}>
          No account needed — you can view and add entries right away, and save your account
          later if you want.
        </ThemedText>
      </View>
      <Button label="Join tally" onPress={() => {}} />
    </Screen>
  );
}
