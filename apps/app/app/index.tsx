import { Redirect } from "expo-router";

// TODO(phase 2): branch on Supabase session — full/guest session -> (app)/(tabs)/dashboard,
// no session -> (auth)/welcome. Auth isn't wired up yet, so this always sends to welcome.
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
