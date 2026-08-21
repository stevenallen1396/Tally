-- 'base64url' isn't a supported encode() argument on this Postgres version
-- (that's a newer addition) — build the equivalent manually from base64.
alter table invites alter column token set default (
  rtrim(translate(encode(extensions.gen_random_bytes(24), 'base64'), '+/', '-_'), '=')
);
