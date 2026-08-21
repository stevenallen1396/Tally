import { useCallback, useEffect, useState } from "react";

import { useSession } from "@/lib/SessionProvider";
import { supabase } from "@/lib/supabase";

export type NotificationItem = {
  id: string;
  tallyId: string | null;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

async function fetchNotifications(userId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, tally_id, title, body, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    tallyId: row.tally_id,
    title: row.title,
    body: row.body,
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export function useNotifications() {
  const { session } = useSession();
  const userId = session?.user.id;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      .channel("notifications-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        refetch,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
    );
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  }, []);

  return { notifications, loading, markRead };
}
