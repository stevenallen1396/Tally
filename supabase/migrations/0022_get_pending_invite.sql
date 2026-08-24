-- Exposes a tally's pending invite token + code (not just the invitee's
-- label, as get_pending_invite_label already does) so the talli page itself
-- can re-show "share this link/code" while waiting for the buddy to join —
-- previously that only ever appeared once, at creation time. Same
-- no-direct-SELECT-on-invites rule as get_pending_invite_label.
create or replace function get_pending_invite(p_tally_id uuid)
returns table(token text, invite_code text) language plpgsql security definer as $$
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  return query
  select i.token, i.invite_code
  from invites i
  where i.tally_id = p_tally_id and i.status = 'pending'
  order by i.created_at desc
  limit 1;
end;
$$;
