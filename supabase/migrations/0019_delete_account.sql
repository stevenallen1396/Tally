-- Account deletion. A deleted user's auth.users row cascades cleanly to
-- profiles/tally_members/push_tokens/notifications (already ON DELETE
-- CASCADE), but every "who did this" column on entries/settlements/
-- invites/tallies referenced auth.users with no ON DELETE behavior — fine
-- while leave_tally only ever removes a tally_members row, but the moment
-- we actually delete the auth.users row itself, any of those columns still
-- pointing at it (from a tally the *other* person kept, i.e. archived, not
-- deleted) would violate the FK. Same fix as notifications.tally_id
-- earlier: make each nullable and ON DELETE SET NULL, so a deleted
-- account's history survives for whoever still holds the talli, just no
-- longer attributed to a live account.

alter table entries alter column created_by drop not null;
alter table entries drop constraint entries_created_by_fkey;
alter table entries add constraint entries_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;
alter table entries drop constraint entries_debtor_id_fkey;
alter table entries add constraint entries_debtor_id_fkey
  foreign key (debtor_id) references auth.users(id) on delete set null;
alter table entries drop constraint entries_creditor_id_fkey;
alter table entries add constraint entries_creditor_id_fkey
  foreign key (creditor_id) references auth.users(id) on delete set null;

alter table settlements alter column debtor_id drop not null;
alter table settlements alter column creditor_id drop not null;
alter table settlements alter column initiated_by drop not null;
alter table settlements drop constraint settlements_debtor_id_fkey;
alter table settlements add constraint settlements_debtor_id_fkey
  foreign key (debtor_id) references auth.users(id) on delete set null;
alter table settlements drop constraint settlements_creditor_id_fkey;
alter table settlements add constraint settlements_creditor_id_fkey
  foreign key (creditor_id) references auth.users(id) on delete set null;
alter table settlements drop constraint settlements_initiated_by_fkey;
alter table settlements add constraint settlements_initiated_by_fkey
  foreign key (initiated_by) references auth.users(id) on delete set null;
alter table settlements drop constraint settlements_confirmed_by_fkey;
alter table settlements add constraint settlements_confirmed_by_fkey
  foreign key (confirmed_by) references auth.users(id) on delete set null;

alter table invites alter column created_by drop not null;
alter table invites drop constraint invites_created_by_fkey;
alter table invites add constraint invites_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;
alter table invites drop constraint invites_accepted_by_fkey;
alter table invites add constraint invites_accepted_by_fkey
  foreign key (accepted_by) references auth.users(id) on delete set null;

alter table tallies alter column created_by drop not null;
alter table tallies drop constraint tallies_created_by_fkey;
alter table tallies add constraint tallies_created_by_fkey
  foreign key (created_by) references auth.users(id) on delete set null;
alter table tallies drop constraint tallies_archived_by_fkey;
alter table tallies add constraint tallies_archived_by_fkey
  foreign key (archived_by) references auth.users(id) on delete set null;

-- Leaves every talli the caller belongs to (same archive-or-delete logic as
-- the regular "Leave talli" flow, so their buddies are notified/left with
-- history exactly the same way) before the edge function deletes the
-- auth.users row itself via the Admin API.
create or replace function leave_all_tallies()
returns void language plpgsql security definer as $$
declare
  t record;
begin
  for t in select tally_id from tally_members where user_id = auth.uid() loop
    perform leave_tally(t.tally_id);
  end loop;
end;
$$;
