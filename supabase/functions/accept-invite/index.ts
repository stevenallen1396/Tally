import { createClient } from "npm:@supabase/supabase-js@2";

import { corsHeaders, handleCors } from "../_shared/cors.ts";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return json({ error: "Invalid session" }, 401);
  }

  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    // fall through to the missing-token check below
  }
  if (!token) {
    return json({ error: "Missing invite token" }, 400);
  }

  // Service-role client: the only place invite tokens are ever resolved.
  // invites has no client-facing SELECT policy, so this lookup can only
  // happen here — a token can't be enumerated via the anon/authenticated API.
  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: invite, error: inviteError } = await admin
    .from("invites")
    .select("id, tally_id, status, expires_at, accepted_by, invitee_label")
    .eq("token", token)
    .maybeSingle();

  if (inviteError || !invite) {
    return json({ error: "Invalid invite link" }, 404);
  }
  if (new Date(invite.expires_at) < new Date()) {
    return json({ error: "This invite link has expired" }, 400);
  }
  if (invite.status === "accepted" && invite.accepted_by !== user.id) {
    return json({ error: "This invite has already been used" }, 400);
  }
  if (invite.status === "revoked") {
    return json({ error: "This invite link was revoked" }, 400);
  }

  const { data: existingMembership } = await admin
    .from("tally_members")
    .select("user_id")
    .eq("tally_id", invite.tally_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMembership) {
    const { error: joinError } = await admin
      .from("tally_members")
      .insert({ tally_id: invite.tally_id, user_id: user.id, role: "member" });
    if (joinError) {
      return json({ error: joinError.message }, 400);
    }
  }

  // Full accounts get a profile via the create-profile screen, but guests
  // skip that step entirely — without this, every other tally member's view
  // shows them as "Waiting to join" forever, even after they've joined.
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!existingProfile) {
    await admin
      .from("profiles")
      .insert({ id: user.id, display_name: invite.invitee_label ?? "Guest" });
  }

  if (invite.status !== "accepted") {
    await admin
      .from("invites")
      .update({ status: "accepted", accepted_by: user.id })
      .eq("id", invite.id);
  }

  return json({ tally_id: invite.tally_id });
});
