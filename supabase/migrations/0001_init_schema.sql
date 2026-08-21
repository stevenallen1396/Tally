-- Core tables for Tally: profiles, tallies (a shared ledger between exactly
-- two people), invites, settlements, entries, push tokens, notifications.

create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table tallies (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  currency text not null default 'GBP',
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table tally_members (
  tally_id uuid not null references tallies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (tally_id, user_id)
);

-- A tally is always between exactly two people.
create or replace function enforce_two_tally_members()
returns trigger language plpgsql as $$
begin
  if (select count(*) from tally_members where tally_id = new.tally_id) > 2 then
    raise exception 'A tally cannot have more than two members';
  end if;
  return new;
end;
$$;

create trigger trg_enforce_two_tally_members
  after insert on tally_members
  for each row execute function enforce_two_tally_members();

create table invites (
  id uuid primary key default gen_random_uuid(),
  tally_id uuid not null references tallies(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(24), 'base64url'),
  created_by uuid not null references auth.users(id),
  invitee_label text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  accepted_by uuid references auth.users(id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

-- debtor_id/creditor_id capture the outstanding balance's direction at the
-- moment the settlement is proposed (same convention as entries) — needed so
-- the confirm trigger knows which way to reverse it to net to zero.
create table settlements (
  id uuid primary key default gen_random_uuid(),
  tally_id uuid not null references tallies(id) on delete cascade,
  debtor_id uuid not null references auth.users(id),
  creditor_id uuid not null references auth.users(id),
  amount_minor integer not null check (amount_minor > 0),
  initiated_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'cancelled')),
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index one_pending_settlement_per_tally
  on settlements (tally_id)
  where status = 'pending';

create table entries (
  id uuid primary key default gen_random_uuid(),
  tally_id uuid not null references tallies(id) on delete cascade,
  debtor_id uuid not null references auth.users(id),
  creditor_id uuid not null references auth.users(id),
  amount_minor integer not null check (amount_minor > 0),
  note text,
  source text not null default 'manual' check (source in ('manual', 'nlp', 'settlement')),
  raw_input text,
  settlement_id uuid references settlements(id),
  created_by uuid not null references auth.users(id),
  updated_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  device_info text,
  last_seen_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tally_id uuid references tallies(id),
  type text not null check (
    type in (
      'entry_added',
      'entry_edited',
      'settlement_proposed',
      'settlement_confirmed',
      'settlement_declined'
    )
  ),
  title text not null,
  body text not null,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index entries_tally_id_idx on entries (tally_id);
create index tally_members_user_id_idx on tally_members (user_id);
create index notifications_user_id_idx on notifications (user_id);
