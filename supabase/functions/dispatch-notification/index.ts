import { createClient } from "npm:@supabase/supabase-js@2";

// Invoked by a pg_net trigger (see migration 0009) right after a row is
// inserted into `notifications` — this function's only job is delivering
// that row as an Expo push notification. It's called with the service role
// key by Postgres itself, never by a client.

Deno.serve(async (req) => {
  let notification_id: string | undefined;
  try {
    ({ notification_id } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Missing notification_id" }), { status: 400 });
  }
  if (!notification_id) {
    return new Response(JSON.stringify({ error: "Missing notification_id" }), { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: notification } = await admin
    .from("notifications")
    .select("user_id, title, body, type, tally_id")
    .eq("id", notification_id)
    .maybeSingle();

  if (!notification) {
    return new Response(JSON.stringify({ error: "Notification not found" }), { status: 404 });
  }

  const { data: tokens } = await admin
    .from("push_tokens")
    .select("expo_push_token")
    .eq("user_id", notification.user_id);

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ delivered: 0 }));
  }

  const messages = tokens.map((t) => ({
    to: t.expo_push_token,
    title: notification.title,
    body: notification.body,
    data: { type: notification.type, tally_id: notification.tally_id },
  }));

  const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(messages),
  });

  const result = await pushResponse.json();
  return new Response(JSON.stringify({ delivered: messages.length, result }));
});
