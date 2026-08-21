-- Atomic "Start a tally": create the tally + the creator's owner membership
-- in one call, so a tally can never exist without an owner (or vice versa).
create or replace function create_tally_with_owner(p_currency text default 'GBP')
returns tallies language plpgsql security definer as $$
declare
  new_tally tallies;
begin
  insert into tallies (created_by, currency) values (auth.uid(), p_currency)
  returning * into new_tally;

  insert into tally_members (tally_id, user_id, role) values (new_tally.id, auth.uid(), 'owner');

  return new_tally;
end;
$$;

-- Computes the current net balance for a tally as (amount owed by p_from to
-- the other member) - (amount owed to p_from by the other member), i.e.
-- positive = p_from is in debt. Used both to propose a settlement for the
-- true live balance (never a client-supplied amount) and by the client to
-- render the balance.
create or replace function tally_balance_minor(p_tally_id uuid, p_from uuid)
returns integer language sql stable as $$
  select coalesce(sum(
    case when debtor_id = p_from then amount_minor else -amount_minor end
  ), 0)::integer
  from entries
  where tally_id = p_tally_id and deleted_at is null;
$$;

-- Proposes a settlement for the tally's current outstanding balance. Fails
-- if there's nothing owed, or a settlement is already pending (partial
-- unique index also enforces this at the DB level).
create or replace function propose_settlement(p_tally_id uuid)
returns settlements language plpgsql security definer as $$
declare
  net integer;
  other_party uuid;
  new_settlement settlements;
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  select user_id into other_party
  from tally_members
  where tally_id = p_tally_id and user_id <> auth.uid()
  limit 1;

  net := tally_balance_minor(p_tally_id, auth.uid());

  if net = 0 then
    raise exception 'This tally is already settled';
  end if;

  insert into settlements (tally_id, debtor_id, creditor_id, amount_minor, initiated_by)
  values (
    p_tally_id,
    case when net > 0 then auth.uid() else other_party end,
    case when net > 0 then other_party else auth.uid() end,
    abs(net),
    auth.uid()
  )
  returning * into new_settlement;

  return new_settlement;
end;
$$;

-- When a settlement is confirmed by the non-initiator, net the tally's
-- balance to zero via a reconciling entry (the reverse of the settlement's
-- own direction) — visible in history rather than a hidden side effect.
-- Declining/cancelling leaves the balance untouched.
create or replace function apply_confirmed_settlement()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'confirmed' and old.status = 'pending' then
    insert into entries (
      tally_id, debtor_id, creditor_id, amount_minor, note, source, settlement_id, created_by
    ) values (
      new.tally_id, new.creditor_id, new.debtor_id, new.amount_minor,
      'Settled up', 'settlement', new.id, new.confirmed_by
    );
  end if;
  return new;
end;
$$;

create trigger trg_apply_confirmed_settlement
  after update on settlements
  for each row execute function apply_confirmed_settlement();
