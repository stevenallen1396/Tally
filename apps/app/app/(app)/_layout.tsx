import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect } from "react";

import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/lib/SessionProvider";
import { registerForPushNotifications } from "@/lib/pushNotifications";
import { supabase } from "@/lib/supabase";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useStackHeaderOptions } from "@/theme/stackHeaderOptions";

// RLS already scopes all data server-side — this guard's job is just making
// sure *some* session exists before rendering. Signed-out visitors get a
// silent anonymous session (the same mechanism invited guests already use)
// instead of being routed to a sign-in gate — starting a tally never
// requires an account; creating one is an optional prompt from Settings.
export default function AppLayout() {
  const { session, loading } = useSession();
  const { profile, loading: profileLoading, fetchError } = useProfile();
  const completedThisSession = useOnboardingStore((state) => state.completedThisSession);
  const pathname = usePathname();
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

  if (loading || !session || profileLoading) {
    return null;
  }

  // First-time visitors (no real name yet) get a one-time name + primary
  // currency step before anything else. Invite-link joiners already picked
  // a name inline on that screen, so this never re-triggers for them —
  // they land with a real display_name already set.
  //
  // Gated on !fetchError: if every read attempt errored, we genuinely don't
  // know whether a profile exists — that's not the same as confirming there
  // isn't one, and treating it as "no profile" is exactly what sent already
  // set-up people through onboarding again (the same failure mode fixed for
  // the profile *write* in onboarding.tsx, just on the read side here).
  const needsOnboarding = !completedThisSession && !fetchError && (!profile || profile.display_name === "Guest");
  if (needsOnboarding && pathname !== "/onboarding") {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, ...headerOptions }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
