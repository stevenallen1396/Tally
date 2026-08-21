-- Row Level Security: every table is scoped to tally membership. Guests
-- (Supabase anonymous auth users) are real auth.users rows with their own
-- tally_members entry, so these policies apply to them identically — no
-- special-casing needed for guest vs full account.

create or replace function is_tally_member(check_tally_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from tally_members
    where tally_id = check_tally_id and user_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
alter table tallies enable row level security;
alter table tally_members enable row level security;
alter table invites enable row level security;
alter table settlements enable row level security;
alter table entries enable row level security;
alter table push_tokens enable row level security;
alter table notifications enable row level security;

-- profiles: readable by self or by anyone sharing a tally; writable by self only.
create policy profiles_select on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from tally_members m1
      join tally_members m2 on m1.tally_id = m2.tally_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid());

-- tallies: members only.
create policy tallies_select on tallies for select using (is_tally_member(id));
create policy tallies_insert on tallies for insert with check (created_by = auth.uid());

-- tally_members: members only.
create policy tally_members_select on tally_members for select using (is_tally_member(tally_id));
create policy tally_members_insert on tally_members for insert with check (is_tally_member(tally_id));

-- invites: no SELECT policy — tokens are only ever resolved inside the
-- accept-invite edge function using the service role key, so they can never
-- be enumerated via the anon/authenticated API.
create policy invites_insert on invites for insert with check (
  created_by = auth.uid() and is_tally_member(tally_id)
);

-- settlements: members can read; only the non-initiator can confirm/decline.
-- No INSERT policy — settlements are only ever created via the
-- propose_settlement() function (SECURITY DEFINER, computes the real balance
-- server-side), never by a direct client insert that could spoof an amount.
create policy settlements_select on settlements for select using (is_tally_member(tally_id));
create policy settlements_update on settlements for update using (
  is_tally_member(tally_id) and auth.uid() <> initiated_by and status = 'pending'
);

-- entries: members can read/create; only the creator can edit. "Delete" is
-- soft (an update setting deleted_at) to preserve the audit trail — there is
-- deliberately no DELETE policy, so a row can never be hard-removed.
create policy entries_select on entries for select using (is_tally_member(tally_id));
create policy entries_insert on entries for insert with check (
  created_by = auth.uid() and is_tally_member(tally_id)
);
create policy entries_update on entries for update using (
  created_by = auth.uid() and is_tally_member(tally_id)
);

-- push_tokens / notifications: owner-only.
create policy push_tokens_all on push_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_select on notifications for select using (user_id = auth.uid());
create policy notifications_update on notifications for update using (user_id = auth.uid());
