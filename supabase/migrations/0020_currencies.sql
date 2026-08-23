-- Multi-currency support: a curated list (GBP/USD/EUR/CAD/AUD, all
-- 2-decimal currencies so formatting stays simple everywhere) rather than
-- the full ISO list. profiles.primary_currency is just a sensible default
-- offered when starting a new talli — each talli's own tallies.currency
-- (already existed, just always defaulted to GBP until now) is the one
-- that actually matters for formatting its balances.

alter table profiles add column if not exists primary_currency text not null default 'GBP';
alter table profiles add constraint profiles_primary_currency_check
  check (primary_currency in ('GBP', 'USD', 'EUR', 'CAD', 'AUD'));

alter table tallies add constraint tallies_currency_check
  check (currency in ('GBP', 'USD', 'EUR', 'CAD', 'AUD'));

create or replace function set_tally_currency(p_tally_id uuid, p_currency text)
returns void language plpgsql security definer as $$
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;
  if p_currency not in ('GBP', 'USD', 'EUR', 'CAD', 'AUD') then
    raise exception 'Unsupported currency';
  end if;

  update tallies set currency = p_currency where id = p_tally_id;
end;
$$;
