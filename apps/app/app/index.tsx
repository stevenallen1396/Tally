import { Redirect } from "expo-router";

import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/lib/SessionProvider";

export default function Index() {
  const { session, loading: sessionLoading } = useSession();
  const { profile, loading: profileLoading } = useProfile();

  if (sessionLoading || (session && profileLoading)) {
    return null;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!profile) {
    return <Redirect href="/(auth)/create-profile" />;
  }

  return <Redirect href="/(app)/tally/new" />;
}
