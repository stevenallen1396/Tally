import { Stack } from "expo-router";
import { useEffect } from "react";

import { useSession } from "@/lib/SessionProvider";
import { registerForPushNotifications } from "@/lib/pushNotifications";
import { supabase } from "@/lib/supabase";
import { useStackHeaderOptions } from "@/theme/stackHeaderOptions";

// RLS already scopes all data server-side — this guard's job is just making
// sure *some* session exists before rendering. Signed-out visitors get a
// silent anonymous session (the same mechanism invited guests already use)
// instead of being routed to a sign-in gate — starting a tally never
// requires an account; creating one is an optional prompt from Settings.
export default function AppLayout() {
  const { session, loading } = useSession();
  const headerOptions = useStackHeaderOptions();

  useEffect(() => {
    if (session) {
      registerForPushNotifications(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    if (!loading && !session) {
      supabase.auth.signInAnonymously();
    }
  }, [loading, session]);

  if (loading || !session) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false, ...headerOptions }}>
      <Stack.Screen name="tally/new" options={{ headerShown: true, title: "Start or join a talli" }} />
      <Stack.Screen name="tally/join" options={{ headerShown: true, title: "Join a talli" }} />
      <Stack.Screen name="tally/[id]/index" options={{ headerShown: true, title: "" }} />
      <Stack.Screen name="tally/[id]/leave" options={{ headerShown: true, title: "" }} />
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
