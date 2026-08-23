import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";
import type { EntryRowData } from "@/components/EntryRow";

import { useTallyPartner } from "./useTallyPartner";

function formatEntryDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

async function fetchEntries(tallyId: string, userId: string) {
  const { data: entries, error } = await supabase
    .from("entries")
    .select("id, debtor_id, amount_minor, note, source, created_at")
    .eq("tally_id", tallyId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows: EntryRowData[] = (entries ?? []).map((entry) => ({
    id: entry.id,
    note: entry.note ?? (entry.source === "settlement" ? "Settled up" : "Entry"),
    amountMinor: entry.debtor_id === userId ? -entry.amount_minor : entry.amount_minor,
    createdAt: formatEntryDate(entry.created_at),
  }));

  const balanceMinor = rows.reduce((sum, row) => sum + row.amountMinor, 0);
  return { entries: rows, balanceMinor };
}

export function useTallyDetail(tallyId: string) {
  const { session } = useSession();
  const userId = session?.user.id;
  const {
    partnerName,
    awaitingPartner,
    closed,
    loading: partnerLoading,
    refetch: refetchPartner,
  } = useTallyPartner(tallyId);
  const [entries, setEntries] = useState<EntryRowData[]>([]);
  const [balanceMinor, setBalanceMinor] = useState(0);
  const [entriesLoading, setEntriesLoading] = useState(true);
  // Unique per mount — a name shared across instances (e.g. revisiting the
  // same tally while a previous instance is still mounted in the
  // background) crashes on double-subscribe.
  const [channelName] = useState(() => `tally-${tallyId}-${Math.random().toString(36).slice(2)}`);

  const refetch = useCallback(() => {
    if (!userId) return;
    setEntriesLoading(true);
    fetchEntries(tallyId, userId)
      .then(({ entries, balanceMinor }) => {
        setEntries(entries);
        setBalanceMinor(balanceMinor);
      })
      .finally(() => setEntriesLoading(false));
  }, [tallyId, userId]);

  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicking off the fetch on mount/dep-change is the point.
    refetch();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entries", filter: `tally_id=eq.${tallyId}` },
        refetch,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tallyId, userId, refetch, channelName]);

  return {
    partnerName,
    awaitingPartner,
    closed,
    entries,
    balanceMinor,
    loading: partnerLoading || entriesLoading,
    refetch,
    refetchPartner,
  };
}
