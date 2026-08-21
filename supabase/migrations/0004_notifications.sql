-- Populates the `notifications` table for the *other* tally member when an
-- entry is added/edited or a settlement changes status. This only creates
-- the in-app notification row; actual push delivery (via the
-- dispatch-notification edge function + pg_net) is wired up in a later
-- migration once Expo push credentials exist (phase 5) — until then these
-- rows still drive the in-app Notifications tab.

create or replace function notify_other_tally_member(
  p_tally_id uuid,
  p_actor uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb default null
) returns void language plpgsql security definer as $$
declare
  recipient uuid;
begin
  select user_id into recipient
  from tally_members
  where tally_id = p_tally_id and user_id <> p_actor
  limit 1;

  if recipient is not null then
    insert into notifications (user_id, tally_id, type, title, body, data)
    values (recipient, p_tally_id, p_type, p_title, p_body, p_data);
  end if;
end;
$$;

create or replace function trg_notify_on_entry()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' and new.source <> 'settlement' then
    perform notify_other_tally_member(
      new.tally_id, new.created_by, 'entry_added',
      'New entry added', coalesce(new.note, 'A new entry was added to your tally'),
      jsonb_build_object('entry_id', new.id)
    );
  elsif tg_op = 'UPDATE' then
    perform notify_other_tally_member(
      new.tally_id, new.created_by, 'entry_edited',
      'Entry updated', coalesce(new.note, 'An entry on your tally was updated'),
      jsonb_build_object('entry_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger trg_entries_notify
  after insert or update on entries
  for each row execute function trg_notify_on_entry();

create or replace function trg_notify_on_settlement()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    perform notify_other_tally_member(
      new.tally_id, new.initiated_by, 'settlement_proposed',
      'Settlement proposed', 'Confirm or decline the proposed settlement',
      jsonb_build_object('settlement_id', new.id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'confirmed' and old.status = 'pending' then
    perform notify_other_tally_member(
      new.tally_id, new.confirmed_by, 'settlement_confirmed',
      'Settlement confirmed', 'Your tally has been settled',
      jsonb_build_object('settlement_id', new.id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'declined' and old.status = 'pending' then
    perform notify_other_tally_member(
      new.tally_id, new.initiated_by, 'settlement_declined',
      'Settlement declined', 'The proposed settlement was declined',
      jsonb_build_object('settlement_id', new.id)
    );
  end if;
  return new;
end;
$$;

create trigger trg_settlements_notify
  after insert or update on settlements
  for each row execute function trg_notify_on_settlement();
