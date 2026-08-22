-- Lets a viewer locally rename how their tally counterpart is displayed —
-- independent of whatever display_name the other person has set on their
-- own account. Stored on the viewer's own tally_members row (not the other
-- member's), since it's inherently one-directional: what *I* call them,
-- not a shared/global name. Applies whether or not they've joined yet, and
-- survives them changing their own account name.

alter table tally_members add column if not exists buddy_nickname text;

create or replace function set_buddy_nickname(p_tally_id uuid, p_nickname text)
returns void language plpgsql security definer as $$
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  update tally_members
  set buddy_nickname = nullif(trim(p_nickname), '')
  where tally_id = p_tally_id and user_id = auth.uid();
end;
$$;
