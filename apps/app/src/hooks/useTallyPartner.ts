import { useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export function useTallyPartner(tallyId: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("Waiting to join");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchPartner = async () => {
      setLoading(true);
      const { data: otherMember } = await supabase
        .from("tally_members")
        .select("user_id")
        .eq("tally_id", tallyId)
        .neq("user_id", userId)
        .maybeSingle();

      if (!otherMember) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", otherMember.user_id)
        .maybeSingle();
      if (cancelled) return;
      setPartnerId(otherMember.user_id);
      if (profile) setPartnerName(profile.display_name);
      setLoading(false);
    };

    fetchPartner();

    return () => {
      cancelled = true;
    };
  }, [tallyId, userId]);

  return { partnerId, partnerName, loading };
}
