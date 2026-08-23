-- Activity previously only ever notified "the other member," so a user's
-- own actions (adding an entry, proposing a settlement) never showed up in
-- their own Activity log — only their buddy's did. Adds a direct-to-user
-- notify helper and uses it to also log the actor's own side, with text
-- appropriate to having just done the thing rather than being told about it.
--
-- Along the way: settlement_declined had a real bug — it called
-- notify_other_tally_member(tally_id, initiated_by, ...), which notifies
-- whoever is *not* the initiator. But the decliner is never the initiator
-- (only the non-initiator can decline, per RLS), so this was notifying the
-- decliner about their own decline instead of telling the initiator their
-- proposal was declined. Fixed by notifying initiated_by directly.

create or replace function notify_tally_member(
  p_tally_id uuid,
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_data jsonb default null
) returns void language plpgsql security definer as $$
begin
  insert into notifications (user_id, tally_id, type, title, body, data)
  values (p_user_id, p_tally_id, p_type, p_title, p_body, p_data);
end;
$$;

create or replace function trg_notify_on_entry()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' and new.source <> 'settlement' then
    perform notify_other_tally_member(
      new.tally_id, new.created_by, 'entry_added',
      'New entry added', coalesce(new.note, 'A new entry was added to your talli'),
      jsonb_build_object('entry_id', new.id)
    );
    perform notify_tally_member(
      new.tally_id, new.created_by, 'entry_added',
      'You added an entry', coalesce(new.note, 'You added a new entry'),
      jsonb_build_object('entry_id', new.id)
    );
  elsif tg_op = 'UPDATE' then
    perform notify_other_tally_member(
      new.tally_id, new.created_by, 'entry_edited',
      'Entry updated', coalesce(new.note, 'An entry on your talli was updated'),
      jsonb_build_object('entry_id', new.id)
    );
    perform notify_tally_member(
      new.tally_id, new.created_by, 'entry_edited',
      'You updated an entry', coalesce(new.note, 'You updated an entry'),
      jsonb_build_object('entry_id', new.id)
    );
  end if;
  return new;
end;
$$;

create or replace function trg_notify_on_settlement()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    perform notify_other_tally_member(
      new.tally_id, new.initiated_by, 'settlement_proposed',
      'Settlement proposed', 'Confirm or decline the proposed settlement',
      jsonb_build_object('settlement_id', new.id)
    );
    perform notify_tally_member(
      new.tally_id, new.initiated_by, 'settlement_proposed',
      'You proposed a settlement', 'Waiting for your buddy to confirm',
      jsonb_build_object('settlement_id', new.id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'confirmed' and old.status = 'pending' then
    perform notify_other_tally_member(
      new.tally_id, new.confirmed_by, 'settlement_confirmed',
      'Settlement confirmed', 'Your talli has been settled',
      jsonb_build_object('settlement_id', new.id)
    );
    perform notify_tally_member(
      new.tally_id, new.confirmed_by, 'settlement_confirmed',
      'Settlement confirmed', 'Your talli has been settled',
      jsonb_build_object('settlement_id', new.id)
    );
  elsif tg_op = 'UPDATE' and new.status = 'declined' and old.status = 'pending' then
    perform notify_tally_member(
      new.tally_id, new.initiated_by, 'settlement_declined',
      'Settlement declined', 'The proposed settlement was declined',
      jsonb_build_object('settlement_id', new.id)
    );
    perform notify_other_tally_member(
      new.tally_id, new.initiated_by, 'settlement_declined',
      'You declined the settlement', 'You declined the proposed settlement',
      jsonb_build_object('settlement_id', new.id)
    );
  end if;
  return new;
end;
$$;
