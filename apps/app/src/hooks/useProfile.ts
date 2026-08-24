import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/SessionProvider";

type Profile = { id: string; display_name: string; avatar_url: string | null; primary_currency: string };

// A restored session can briefly hold a stale access token while
// supabase-js refreshes it in the background (most visible on Safari,
// where a session pulled back out of storage after a while away is more
// likely to need that refresh) — this query fails during that window with
// an auth error, not a real "no profile" result. Treating an error the
// same as "no profile" incorrectly sent people who'd already set up an
// account through onboarding again. Retry with backoff before giving up.
async function fetchProfileWithRetry(userId: string): Promise<Profile | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, primary_currency")
      .eq("id", userId)
      .maybeSingle();
    if (!error) return data;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
  return null;
}

export function useProfile() {
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!session) return;
    setLoading(true);
    fetchProfileWithRetry(session.user.id).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [session]);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no async work to do; this *is* the result.
      setProfile(null);
      setLoading(false);
      return;
    }
    refetch();
  }, [session, refetch]);

  return { profile, loading, refetch };
}
