import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export type NotificationItem = {
  id: string;
  tallyId: string | null;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  partnerName: string | null;
  description: string | null;
  amountMinor: number | null; // signed relative to viewer (positive = credit, negative = debit); null if unknown
  currency: string;
};

type NotificationRow = {
  id: string;
  tally_id: string | null;
  type: string;
  title: string;
  body: string;
  created_at: string;
  data: { entry_id?: string; settlement_id?: string } | null;
};

async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, tally_id, type, title, body, created_at, data")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  const rows = (data ?? []) as NotificationRow[];

  const tallyIds = [...new Set(rows.map((row) => row.tally_id).filter((id): id is string => !!id))];
  const entryIds = [...new Set(rows.map((row) => row.data?.entry_id).filter((id): id is string => !!id))];
  const settlementIds = [
    ...new Set(rows.map((row) => row.data?.settlement_id).filter((id): id is string => !!id)),
  ];

  const [otherMembers, entries, settlementEntries, tallies] = await Promise.all([
    tallyIds.length > 0
      ? supabase.from("tally_members").select("tally_id, user_id").in("tally_id", tallyIds).neq("user_id", userId)
      : Promise.resolve({ data: [], error: null }),
    entryIds.length > 0
      ? supabase.from("entries").select("id, debtor_id, amount_minor, note").in("id", entryIds)
      : Promise.resolve({ data: [], error: null }),
    settlementIds.length > 0
      ? supabase
          .from("entries")
          .select("settlement_id, debtor_id, amount_minor, note")
          .in("settlement_id", settlementIds)
      : Promise.resolve({ data: [], error: null }),
    tallyIds.length > 0
      ? supabase.from("tallies").select("id, currency").in("id", tallyIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const currencyByTally = new Map((tallies.data ?? []).map((t) => [t.id, t.currency]));
  const otherUserIdByTally = new Map((otherMembers.data ?? []).map((m) => [m.tally_id, m.user_id]));
  const otherUserIds = [...new Set(otherUserIdByTally.values())];
  const { data: profiles } =
    otherUserIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", otherUserIds)
      : { data: [] };
  const displayNameByUserId = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));

  const entryById = new Map((entries.data ?? []).map((entry) => [entry.id, entry]));
  const entryBySettlementId = new Map((settlementEntries.data ?? []).map((entry) => [entry.settlement_id, entry]));

  return rows.map((row) => {
    const otherUserId = row.tally_id ? otherUserIdByTally.get(row.tally_id) : undefined;
    const partnerName = otherUserId ? (displayNameByUserId.get(otherUserId) ?? null) : null;

    const linkedEntry = row.data?.entry_id
      ? entryById.get(row.data.entry_id)
      : row.data?.settlement_id
        ? entryBySettlementId.get(row.data.settlement_id)
        : undefined;

    const amountMinor = linkedEntry
      ? linkedEntry.debtor_id === userId
        ? -linkedEntry.amount_minor
        : linkedEntry.amount_minor
      : null;
    const description = linkedEntry?.note ?? null;

    return {
      id: row.id,
      tallyId: row.tally_id,
      type: row.type,
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
      partnerName,
      description,
      amountMinor,
      currency: (row.tally_id ? currencyByTally.get(row.tally_id) : null) ?? "GBP",
    };
  });
}

export function useNotifications() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Unique per mount — a hardcoded channel name collides (and crashes) if a
  // second instance of this hook is ever alive at the same time, e.g. a
  // background tab screen kept mounted by the tab navigator.
  const [channelName] = useState(() => `notifications-inbox-${Math.random().toString(36).slice(2)}`);

  const refetch = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    fetchNotifications(userId)
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the fetch on mount/dep-change is the point.
    refetch();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        refetch,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch, channelName]);

  return { notifications, loading };
}
