import { withSupabase } from "npm:@supabase/server@^1";

// Reassigns everything owned by an abandoned anonymous ("guest") session
// onto the account the caller just signed into. Only reachable right after
// signing in from a guest session — the client hands over the guest
// session's own access token, which we independently verify here rather
// than trusting a client-supplied user id, so a caller can't merge someone
// else's guest data into their own account by guessing an id.
export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const targetUserId = ctx.userClaims.id;
    const admin = ctx.supabaseAdmin;

    let guest_access_token: string | undefined;
    try {
      ({ guest_access_token } = await req.json());
    } catch {
      // fall through to the missing-token check below
    }
    if (!guest_access_token) {
      return Response.json({ error: "Missing guest session" }, { status: 400 });
    }

    const { data: guestAuth, error: guestAuthError } = await admin.auth.getUser(guest_access_token);
    if (guestAuthError || !guestAuth.user) {
      return Response.json({ error: "That guest session has expired" }, { status: 400 });
    }
    if (!guestAuth.user.is_anonymous) {
      return Response.json({ error: "Not a guest session" }, { status: 400 });
    }
    const guestUserId = guestAuth.user.id;
    if (guestUserId === targetUserId) {
      return Response.json({ merged: 0 });
    }

    // Tallies the target account already belongs to can't also take the
    // guest's membership row (one row per tally per user) — those are left
    // on the guest identity and simply disappear along with it below. For a
    // two-person ledger this only happens if the same person was already in
    // that exact talli under both identities, which is vanishingly rare.
    const { data: targetTallies } = await admin
      .from("tally_members")
      .select("tally_id")
      .eq("user_id", targetUserId);
    const targetTallyIds = new Set((targetTallies ?? []).map((t) => t.tally_id));

    const { data: guestTallies } = await admin
      .from("tally_members")
      .select("tally_id")
      .eq("user_id", guestUserId);
    const movableTallyIds = (guestTallies ?? [])
      .map((t) => t.tally_id)
      .filter((id) => !targetTallyIds.has(id));

    if (movableTallyIds.length > 0) {
      await admin
        .from("tally_members")
        .update({ user_id: targetUserId })
        .eq("user_id", guestUserId)
        .in("tally_id", movableTallyIds);
    }

    for (const [table, columns] of [
      ["entries", ["created_by", "debtor_id", "creditor_id"]],
      ["settlements", ["debtor_id", "creditor_id", "initiated_by", "confirmed_by"]],
      ["invites", ["created_by", "accepted_by"]],
      ["tallies", ["created_by", "archived_by"]],
    ] as const) {
      for (const column of columns) {
        await admin.from(table).update({ [column]: targetUserId }).eq(column, guestUserId);
      }
    }

    // Whatever's left on the guest identity (any conflicting tally_members
    // row, its profile row, etc.) goes with it.
    const { error: deleteError } = await admin.auth.admin.deleteUser(guestUserId);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ merged: movableTallyIds.length });
  }),
};
