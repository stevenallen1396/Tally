-- Lets a tally creator log entries before their buddy has joined. An entry
-- always has a known side (whoever's adding it) and a pending side (the
-- buddy, not a real user yet) — so debtor_id/creditor_id become nullable,
-- with exactly one of them allowed to be null at a time. accept-invite
-- backfills the pending side for every entry in the tally the moment the
-- buddy actually joins.

alter table entries alter column debtor_id drop not null;
alter table entries alter column creditor_id drop not null;

alter table entries add constraint entries_has_a_known_party
  check (debtor_id is not null or creditor_id is not null);

-- Null-safe rewrite: the previous CASE assumed debtor_id/creditor_id were
-- always both present, so a pending entry's null debtor_id (matched by
-- neither branch condition being true) silently fell through to the wrong
-- sign. Not reachable via propose_settlement today (it separately requires
-- a real other_party), but worth being correct regardless.
create or replace function tally_balance_minor(p_tally_id uuid, p_from uuid)
returns integer language sql stable as $$
  select coalesce(sum(
    case
      when debtor_id = p_from then amount_minor
      when creditor_id = p_from then -amount_minor
      else 0
    end
  ), 0)::integer
  from entries
  where tally_id = p_tally_id and deleted_at is null;
$$;

alter table notifications drop constraint notifications_type_check;
alter table notifications add constraint notifications_type_check check (
  type in (
    'entry_added',
    'entry_edited',
    'settlement_proposed',
    'settlement_confirmed',
    'settlement_declined',
    'member_left',
    'member_joined'
  )
);
