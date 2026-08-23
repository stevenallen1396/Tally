import { withSupabase } from "npm:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims.id;
    // Service-role client: the only place invite tokens are ever resolved.
    // invites has no client-facing SELECT policy, so this lookup can only
    // happen here — a token can't be enumerated via the anon/authenticated API.
    const admin = ctx.supabaseAdmin;

    let token: string | undefined;
    let code: string | undefined;
    let display_name: string | undefined;
    try {
      ({ token, code, display_name } = await req.json());
    } catch {
      // fall through to the missing-token check below
    }
    if (!token && !code) {
      return Response.json({ error: "Missing invite token or code" }, { status: 400 });
    }

    const query = admin.from("invites").select("id, tally_id, status, expires_at, accepted_by, invitee_label");
    const { data: invite, error: inviteError } = token
      ? await query.eq("token", token).maybeSingle()
      : await query.eq("invite_code", code!.trim().toLowerCase().replace(/\s+/g, "-")).maybeSingle();

    if (inviteError || !invite) {
      return Response.json({ error: code ? "Invalid invite code" : "Invalid invite link" }, { status: 404 });
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
    const isNewJoin = !existingMembership;

    if (isNewJoin) {
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
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, display_name")
      .eq("id", userId)
      .maybeSingle();

    const trimmedName = display_name?.trim();
    let joinerName = existingProfile?.display_name ?? null;
    if (!existingProfile) {
      joinerName = trimmedName || invite.invitee_label || "Guest";
      await admin.from("profiles").insert({ id: userId, display_name: joinerName });
    } else if (existingProfile.display_name === "Guest" && trimmedName) {
      joinerName = trimmedName;
      await admin.from("profiles").update({ display_name: joinerName }).eq("id", userId);
    }

    if (isNewJoin) {
      // The creator may have logged entries before anyone joined — those
      // have a null "pending" side (whichever wasn't the creator). Now that
      // there's a real second member, fill it in on every such entry.
      await admin
        .from("entries")
        .update({ debtor_id: userId })
        .eq("tally_id", invite.tally_id)
        .is("debtor_id", null);
      await admin
        .from("entries")
        .update({ creditor_id: userId })
        .eq("tally_id", invite.tally_id)
        .is("creditor_id", null);

      const { data: otherMember } = await admin
        .from("tally_members")
        .select("user_id")
        .eq("tally_id", invite.tally_id)
        .neq("user_id", userId)
        .maybeSingle();

      if (otherMember) {
        const { data: otherProfile } = await admin
          .from("profiles")
          .select("display_name")
          .eq("id", otherMember.user_id)
          .maybeSingle();
        const otherName = otherProfile?.display_name ?? "your buddy";

        await admin.from("notifications").insert([
          {
            user_id: otherMember.user_id,
            tally_id: invite.tally_id,
            type: "member_joined",
            title: `${joinerName ?? "Your buddy"} joined your tally`,
            body: "You can start tallying together.",
          },
          {
            user_id: userId,
            tally_id: invite.tally_id,
            type: "member_joined",
            title: `You joined ${otherName}'s tally`,
            body: "You can start tallying together.",
          },
        ]);
      }
    }

    if (invite.status !== "accepted") {
      await admin.from("invites").update({ status: "accepted", accepted_by: userId }).eq("id", invite.id);
    }

    return Response.json({ tally_id: invite.tally_id });
  }),
};
