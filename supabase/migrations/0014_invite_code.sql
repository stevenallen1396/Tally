-- Adds a short, memorable invite code (two quirky words) alongside the
-- existing invite link, for a buddy who'd rather type a code than tap a
-- link. Same invite row, same acceptance flow — just a second way in.

alter table invites add column if not exists invite_code text unique;

create or replace function generate_invite_code()
returns text language plpgsql as $$
declare
  adjectives text[] := array[
    'mellow','spicy','dusty','plucky','jolly','cosmic','salty','breezy',
    'cheeky','wobbly','zesty','foggy','sunny','snappy','quirky','bouncy',
    'husky','chilly','groovy','sneaky','peppy','misty','tangy','bold'
  ];
  nouns text[] := array[
    'otter','walrus','badger','falcon','mango','biscuit','pretzel','noodle',
    'penguin','gecko','wombat','lobster','hedgehog','moose','koala','toucan',
    'puffin','ferret','panda','raccoon','beetle','sparrow','turnip','yak'
  ];
  candidate text;
begin
  loop
    candidate := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
      || '-' || nouns[1 + floor(random() * array_length(nouns, 1))::int];
    exit when not exists (select 1 from invites where invite_code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function create_invite(p_tally_id uuid, p_invitee_label text default null)
returns invites language plpgsql security definer as $$
declare
  new_invite invites;
begin
  if not is_tally_member(p_tally_id) then
    raise exception 'Not a member of this tally';
  end if;

  insert into invites (tally_id, created_by, invitee_label, invite_code)
  values (p_tally_id, auth.uid(), p_invitee_label, generate_invite_code())
  returning * into new_invite;

  return new_invite;
end;
$$;
