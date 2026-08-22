import { withSupabase } from "npm:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims.id;
    // Service-role client: the only place invite tokens are ever resolved.
    // invites has no client-facing SELECT policy, so this lookup can only
    // happen here — a token can't be enumerated via the anon/authenticated API.
    const admin = ctx.supabaseAdmin;

    let token: string | undefined;
    try {
      ({ token } = await req.json());
    } catch {
      // fall through to the missing-token check below
    }
    if (!token) {
      return Response.json({ error: "Missing invite token" }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await admin
      .from("invites")
      .select("id, tally_id, status, expires_at, accepted_by, invitee_label")
      .eq("token", token)
      .maybeSingle();

    if (inviteError || !invite) {
      return Response.json({ error: "Invalid invite link" }, { status: 404 });
    }
    if (new Date(invite.expires_at) < new Date()) {
      return Response.json({ error: "This invite link has expired" }, { status: 400 });
    }
    if (invite.status === "accepted" && invite.accepted_by !== userId) {
      return Response.json({ error: "This invite has already been used" }, { status: 400 });
    }
    if (invite.status === "revoked") {
      return Response.json({ error: "This invite link was revoked" }, { status: 400 });
    }

    const { data: existingMembership } = await admin
      .from("tally_members")
      .select("user_id")
      .eq("tally_id", invite.tally_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingMembership) {
      const { error: joinError } = await admin
        .from("tally_members")
        .insert({ tally_id: invite.tally_id, user_id: userId, role: "member" });
      if (joinError) {
        return Response.json({ error: joinError.message }, { status: 400 });
      }
    }

    // Full accounts get a profile via the create-profile screen, but guests
    // skip that step entirely — without this, every other tally member's
    // view shows them as "Waiting to join" forever, even after joining.
    const { data: existingProfile } = await admin.from("profiles").select("id").eq("id", userId).maybeSingle();

    if (!existingProfile) {
      await admin.from("profiles").insert({ id: userId, display_name: invite.invitee_label ?? "Guest" });
    }

    if (invite.status !== "accepted") {
      await admin.from("invites").update({ status: "accepted", accepted_by: userId }).eq("id", invite.id);
    }

    return Response.json({ tally_id: invite.tally_id });
  }),
};
