-- invites_insert (direct client insert gated by RLS) turned out to hit an
-- unexplained RLS evaluation anomaly in this project: both `created_by =
-- auth.uid()` and `is_tally_member(tally_id)` verified individually true
-- (via direct SQL under the exact simulated request context), yet the same
-- conditions failed inside an actual INSERT's WITH CHECK, even reduced to
-- a single condition. Rather than depend on a client-side RLS check for a
-- security-relevant write, move invite creation into a SECURITY DEFINER
-- function — the same pattern already used for create_tally_with_owner and
-- propose_settlement, and consistent with settlements having no INSERT
-- policy at all.

drop policy if exists invites_insert on invites;

create or replace function create_invite(p_tally_id uuid, p_invitee_label text default null)
returns invites language plpgsql security definer as $$
declare
  new_invite invites;
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  insert into invites (tally_id, created_by, invitee_label)
  values (p_tally_id, auth.uid(), p_invitee_label)
  returning * into new_invite;

  return new_invite;
end;
$$;
