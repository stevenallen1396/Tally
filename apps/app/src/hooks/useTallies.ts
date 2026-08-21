import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import type { TallyCardData } from "@/components/TallyCard";

async function fetchTallies(userId: string): Promise<TallyCardData[]> {
  const { data: myMemberships, error: membershipError } = await supabase
    .from("tally_members")
    .select("tally_id")
    .eq("user_id", userId);
  if (membershipError) throw membershipError;

  const tallyIds = (myMemberships ?? []).map((m) => m.tally_id);
  if (tallyIds.length === 0) return [];

  const { data: otherMembers, error: otherMembersError } = await supabase
    .from("tally_members")
    .select("tally_id, user_id")
    .in("tally_id", tallyIds)
    .neq("user_id", userId);
  if (otherMembersError) throw otherMembersError;

  const otherUserIds = (otherMembers ?? []).map((m) => m.user_id);
  const { data: profiles, error: profilesError } =
    otherUserIds.length > 0
      ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", otherUserIds)
      : { data: [], error: null };
  if (profilesError) throw profilesError;

  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("tally_id, debtor_id, amount_minor")
    .in("tally_id", tallyIds)
    .is("deleted_at", null);
  if (entriesError) throw entriesError;

  const displayNameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const avatarUrlByUserId = new Map((profiles ?? []).map((p) => [p.id, p.avatar_url]));
  const otherUserIdByTally = new Map((otherMembers ?? []).map((m) => [m.tally_id, m.user_id]));

  const balanceByTally = new Map<string, number>();
  for (const entry of entries ?? []) {
    const delta = entry.debtor_id === userId ? -entry.amount_minor : entry.amount_minor;
    balanceByTally.set(entry.tally_id, (balanceByTally.get(entry.tally_id) ?? 0) + delta);
  }

  // Tallies with no other member yet still get a real name — the one the
  // owner gave them at invite time — rather than a placeholder standing in
  // for it. "Waiting to join" becomes a separate status flag.
  const unjoinedTallyIds = tallyIds.filter((tallyId) => !otherUserIdByTally.has(tallyId));
  const pendingLabels = await Promise.all(
    unjoinedTallyIds.map((tallyId) =>
      supabase.rpc("get_pending_invite_label", { p_tally_id: tallyId }).then(({ data }) => data),
    ),
  );
  const pendingLabelByTally = new Map(unjoinedTallyIds.map((id, i) => [id, pendingLabels[i]]));

  return tallyIds.map((tallyId) => {
    const otherUserId = otherUserIdByTally.get(tallyId);
    const awaitingPartner = !otherUserId;
    const partnerName = otherUserId
      ? (displayNameByUserId.get(otherUserId) ?? "your tally partner")
      : (pendingLabelByTally.get(tallyId) ?? "your tally partner");
    return {
      id: tallyId,
      partnerName,
      partnerAvatarUrl: (otherUserId ? avatarUrlByUserId.get(otherUserId) : null) ?? null,
      awaitingPartner,
      balanceMinor: balanceByTally.get(tallyId) ?? 0,
    };
  });
}

export function useTallies() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [tallies, setTallies] = useState<TallyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!userId) return;
    fetchTallies(userId)
      .then(setTallies)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- no async work to do; this *is* the result.
      setTallies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    refetch();

    const channel = supabase
      .channel("dashboard-tallies")
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "tally_members" }, refetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  return { tallies, loading, refetch };
}
