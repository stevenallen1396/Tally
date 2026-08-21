import { Redirect } from "expo-router";

// The (app) layout takes care of ensuring a session exists — anonymous if
// there isn't one already — so every visitor, signed in or not, lands
// straight on "Start a tally" rather than a sign-in gate.
export default function Index() {
  return <Redirect href="/(app)/tally/new" />;
}
