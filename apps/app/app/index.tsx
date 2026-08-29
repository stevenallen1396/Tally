import { Redirect } from "expo-router";

// The (app) layout takes care of ensuring a session exists — anonymous if
// there isn't one already — so every visitor, signed in or not, lands
// straight on the dashboard rather than a sign-in gate. The dashboard's own
// empty state (CTA + "have a code?" link + tip ticker) covers first-time
// visitors, so there's no need to route them through "Start a talli" first.
export default function Index() {
  return <Redirect href="/(app)/(tabs)/dashboard" />;
}
