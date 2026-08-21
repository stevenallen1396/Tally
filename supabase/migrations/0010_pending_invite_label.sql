-- Exposes just the invitee's label for a tally's pending invite, without
-- granting any SELECT access to the invites table itself (which deliberately
-- has none, so tokens can never be enumerated). Used so a tally can always
-- show the partner's name — even before they've joined — instead of a
-- generic "waiting to join" placeholder standing in for the name.
create or replace function get_pending_invite_label(p_tally_id uuid)
returns text language plpgsql security definer as $$
declare
  label text;
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  select invitee_label into label
  from invites
  where tally_id = p_tally_id and status = 'pending'
  order by created_at desc
  limit 1;

  return label;
end;
$$;
