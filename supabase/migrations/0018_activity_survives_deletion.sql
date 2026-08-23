-- Removing a tally used to wipe every notification tied to it first (the
-- only way to avoid violating notifications.tally_id's FK, since it had no
-- ON DELETE behavior) — which meant a talli's whole Activity history
-- vanished the moment it was deleted, for both people, even though they
-- were still around to read it. Switch the FK to ON DELETE SET NULL: the
-- talli's gone, but the notification rows (and their title/body text) live
-- on with tally_id simply cleared, so tapping them no longer navigates
-- anywhere but the log entry itself stays.

alter table notifications drop constraint notifications_tally_id_fkey;
alter table notifications add constraint notifications_tally_id_fkey
  foreign key (tally_id) references tallies(id) on delete set null;

create or replace function leave_tally(p_tally_id uuid)
returns void language plpgsql security definer as $$
declare
  member_count int;
  other_member uuid;
  leaver_name text;
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  select count(*) into member_count from tally_members where tally_id = p_tally_id;

  if member_count <= 1 then
    -- No one else to notify, but the person removing it still gets their
    -- own record of it in Activity.
    insert into notifications (user_id, tally_id, type, title, body)
    values (auth.uid(), p_tally_id, 'member_left', 'You removed a talli', 'It''s gone for good.');
    delete from tallies where id = p_tally_id;
    return;
  end if;

  select user_id into other_member
  from tally_members
  where tally_id = p_tally_id and user_id <> auth.uid();

  delete from tally_members where tally_id = p_tally_id and user_id = auth.uid();

  select display_name into leaver_name from profiles where id = auth.uid();

  update tallies
  set archived_at = now(), archived_by = auth.uid(), archived_by_name = leaver_name
  where id = p_tally_id;

  insert into notifications (user_id, tally_id, type, title, body)
  values (
    other_member,
    p_tally_id,
    'member_left',
    coalesce(leaver_name, 'Your buddy') || ' left this talli',
    'This talli is now closed. You can remove it from your dashboard whenever you''re ready.'
  );
  insert into notifications (user_id, tally_id, type, title, body)
  values (
    auth.uid(),
    p_tally_id,
    'member_left',
    'You left this talli',
    'They''ll be notified, and can remove it from their side whenever they''re ready.'
  );
end;
$$;
