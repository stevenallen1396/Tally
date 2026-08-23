import { withSupabase } from "npm:@supabase/server@^1";

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims.id;

    // Same archive-or-delete logic as the regular "Leave talli" flow, run
    // for every talli the caller belongs to, so buddies are notified/left
    // with history exactly the same way a normal leave would.
    const { error: leaveError } = await ctx.supabase.rpc("leave_all_tallies");
    if (leaveError) {
      return Response.json({ error: leaveError.message }, { status: 400 });
    }

    // Requires the service-role client — deleting an auth.users row isn't
    // something the user-scoped client can ever do itself.
    const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ deleted: true });
  }),
};
