import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/SessionProvider";

type Profile = { id: string; display_name: string; avatar_url: string | null };

export function useProfile() {
  const { session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no async work to do; this *is* the result.
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
  }, [session]);

  return { profile, loading };
}
