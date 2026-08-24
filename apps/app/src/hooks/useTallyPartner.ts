import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export function useTallyPartner(tallyId: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [awaitingPartner, setAwaitingPartner] = useState(false);
  const [closed, setClosed] = useState(false);
  const [currency, setCurrency] = useState("GBP");
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // A locally-set nickname (how *this* viewer refers to the other party)
    // always wins over whatever name would otherwise be shown.
    const { data: myMembership } = await supabase
      .from("tally_members")
      .select("buddy_nickname")
      .eq("tally_id", tallyId)
      .eq("user_id", userId)
      .maybeSingle();
    const nickname = myMembership?.buddy_nickname ?? null;

    const { data: tally } = await supabase
      .from("tallies")
      .select("archived_at, archived_by_name, currency")
      .eq("id", tallyId)
      .maybeSingle();
    setCurrency(tally?.currency ?? "GBP");

    if (tally?.archived_at) {
      setClosed(true);
      setPartnerName(nickname ?? tally.archived_by_name ?? "your buddy");
      setAwaitingPartner(false);
      setInviteToken(null);
      setInviteCode(null);
      setLoading(false);
      return;
    }
    setClosed(false);

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
      const { data: pendingInvite } = await supabase
        .rpc("get_pending_invite", { p_tally_id: tallyId })
        .maybeSingle();
      setPartnerId(null);
      setPartnerName(nickname ?? label ?? "your buddy");
      setAwaitingPartner(true);
      setInviteToken(pendingInvite?.token ?? null);
      setInviteCode(pendingInvite?.invite_code ?? null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", otherMember.user_id)
      .maybeSingle();
    setPartnerId(otherMember.user_id);
    setAwaitingPartner(false);
    setInviteToken(null);
    setInviteCode(null);
    setPartnerName(nickname ?? profile?.display_name ?? "your buddy");
    setLoading(false);
  }, [tallyId, userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the fetch on mount/dep-change is the point.
    refetch();
  }, [refetch]);

  return {
    partnerId,
    partnerName,
    awaitingPartner,
    closed,
    currency,
    inviteToken,
    inviteCode,
    loading,
    refetch,
  };
}
