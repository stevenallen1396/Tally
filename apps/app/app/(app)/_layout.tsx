import { Stack } from "expo-router";

// TODO(phase 2): redirect to /(auth)/welcome when there's no Supabase session
// (full account or anonymous guest). RLS already scopes all data server-side,
// so this guard only exists to route users to the right entry screen.
export default function AppLayout() {
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
