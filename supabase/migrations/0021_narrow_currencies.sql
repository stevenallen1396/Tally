-- Trim the curated currency list down to Pounds/Dollars/Euros — CAD and AUD
-- were never actually needed. Any existing rows on the dropped currencies
-- fall back to GBP before the tighter check constraint is applied.

update profiles set primary_currency = 'GBP' where primary_currency in ('CAD', 'AUD');
update tallies set currency = 'GBP' where currency in ('CAD', 'AUD');

alter table profiles drop constraint profiles_primary_currency_check;
alter table profiles add constraint profiles_primary_currency_check
  check (primary_currency in ('GBP', 'USD', 'EUR'));

alter table tallies drop constraint tallies_currency_check;
alter table tallies add constraint tallies_currency_check
  check (currency in ('GBP', 'USD', 'EUR'));

create or replace function set_tally_currency(p_tally_id uuid, p_currency text)
returns void language plpgsql security definer as $$
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;
  if p_currency not in ('GBP', 'USD', 'EUR') then
    raise exception 'Unsupported currency';
  end if;

  update tallies set currency = p_currency where id = p_tally_id;
end;
$$;
