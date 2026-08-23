-- create_tally_with_owner never gave the owner a profiles row — only
-- accept-invite did that, for the person joining. Since starting a tally
-- as a guest never touches create-profile.tsx, an owner who hasn't visited
-- Settings had no profile row at all, so their buddy's useTallyPartner
-- lookup came back empty and silently fell back to "your buddy". Seed a
-- placeholder row here too, on the same "Guest" default, so there's always
-- something to show — editable later via Settings > Profile.

create or replace function create_tally_with_owner(p_currency text default 'GBP')
returns tallies language plpgsql security definer as $$
declare
  new_tally tallies;
begin
  insert into tallies (created_by, currency) values (auth.uid(), p_currency)
  returning * into new_tally;

  insert into tally_members (tally_id, user_id, role) values (new_tally.id, auth.uid(), 'owner');

  insert into profiles (id, display_name) values (auth.uid(), 'Guest')
  on conflict (id) do nothing;

  return new_tally;
end;
$$;
