-- Lets either tally member leave/delete a tally at any time, even before an
-- invite has been accepted. Leaving is symmetric and self-cleaning: with
-- only one member left (a still-pending invite, or the other member already
-- left) it hard-deletes everything; with two active members it archives the
-- tally instead of deleting it outright, so the remaining member keeps
-- their history and can see + dismiss it at their own pace rather than
-- having it vanish under them.

alter table notifications drop constraint notifications_type_check;
alter table notifications add constraint notifications_type_check check (
  type in (
    'entry_added',
    'entry_edited',
    'settlement_proposed',
    'settlement_confirmed',
    'settlement_declined',
    'member_left'
  )
);

alter table tallies add column if not exists archived_by uuid references auth.users(id);
-- Denormalized snapshot of the leaver's name at the moment they leave: once
-- their tally_members row is gone, profiles_select's "shares a tally" check
-- no longer lets the remaining member read their profile, so this is the
-- only way the dashboard can still say who left.
alter table tallies add column if not exists archived_by_name text;

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
    -- No one left to notify — clear the tally out entirely. notifications
    -- doesn't cascade on tally_id (unlike entries/settlements/invites/
    -- tally_members), so it has to go first.
    delete from notifications where tally_id = p_tally_id;
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
    coalesce(leaver_name, 'Your buddy') || ' left this tally',
    'This tally is now closed. You can remove it from your dashboard whenever you''re ready.'
  );
end;
$$;

-- Once archived, a tally is closed — block new entries landing on it (the
-- client also stops showing Add entry/Settle up, this is the DB-level
-- backstop).
drop policy if exists entries_insert on entries;
create policy entries_insert on entries for insert with check (
  created_by = auth.uid()
  and is_tally_member(tally_id)
  and not exists (select 1 from tallies where id = tally_id and archived_at is not null)
);
