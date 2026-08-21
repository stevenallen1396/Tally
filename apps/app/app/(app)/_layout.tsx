import { Redirect, Stack } from "expo-router";

import { useSession } from "@/lib/SessionProvider";

// RLS already scopes all data server-side — this guard only exists to route
// signed-out users to the right entry screen, not for security.
export default function AppLayout() {
  const { session, loading } = useSession();

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tally/new" options={{ headerShown: true, title: "Start a tally" }} />
      <Stack.Screen name="tally/[id]/index" options={{ headerShown: true, title: "" }} />
      <Stack.Screen
        name="tally/[id]/add-entry"
        options={{ headerShown: true, title: "Add entry", presentation: "modal" }}
      />
      <Stack.Screen
        name="tally/[id]/settle-up"
        options={{ headerShown: true, title: "Settle up", presentation: "modal" }}
      />
      <Stack.Screen
        name="tally/[id]/settle-confirm"
        options={{ headerShown: true, title: "Confirm settlement", presentation: "modal" }}
      />
      <Stack.Screen
        name="tally/[id]/entry/[entryId]"
        options={{ headerShown: true, title: "Edit entry", presentation: "modal" }}
      />
    </Stack>
  );
}
