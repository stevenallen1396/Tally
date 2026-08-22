import { useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export function useTallyPartner(tallyId: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("your buddy");
  const [awaitingPartner, setAwaitingPartner] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const fetchPartner = async () => {
      setLoading(true);
      const { data: tally } = await supabase
        .from("tallies")
        .select("archived_at, archived_by_name")
        .eq("id", tallyId)
        .maybeSingle();

      if (tally?.archived_at) {
        if (cancelled) return;
        setClosed(true);
        setPartnerName(tally.archived_by_name ?? "your buddy");
        setAwaitingPartner(false);
        setLoading(false);
        return;
      }

      const { data: otherMember } = await supabase
        .from("tally_members")
        .select("user_id")
        .eq("tally_id", tallyId)
        .neq("user_id", userId)
        .maybeSingle();

      if (!otherMember) {
        // No one's joined yet — show the name the owner gave them at
        // invite time instead of a placeholder standing in for the name.
        const { data: label } = await supabase.rpc("get_pending_invite_label", {
          p_tally_id: tallyId,
        });
        if (cancelled) return;
        if (label) setPartnerName(label);
        setAwaitingPartner(true);
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", otherMember.user_id)
        .maybeSingle();
      if (cancelled) return;
      setPartnerId(otherMember.user_id);
      setAwaitingPartner(false);
      if (profile) setPartnerName(profile.display_name);
      setLoading(false);
    };

    fetchPartner();

    return () => {
      cancelled = true;
    };
  }, [tallyId, userId]);

  return { partnerId, partnerName, awaitingPartner, closed, loading };
}
