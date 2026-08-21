-- Fires the dispatch-notification edge function (async, via pg_net) right
-- after a row lands in `notifications`, so push delivery happens
-- automatically regardless of which path created the notification (RPC,
-- trigger, or otherwise) — never something the client has to remember to
-- call itself. `project_url` and `service_role_key` are stored in Supabase
-- Vault (set up out-of-band, not in any migration) since the actual values
-- must never appear in a committed file.

create extension if not exists pg_net;

create or replace function dispatch_notification_via_pg_net()
returns trigger language plpgsql security definer as $$
declare
  project_url text;
  service_role_key text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into service_role_key from vault.decrypted_secrets where name = 'service_role_key';

  perform net.http_post(
    url := project_url || '/functions/v1/dispatch-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := jsonb_build_object('notification_id', new.id),
    timeout_milliseconds := 10000
  );

  return new;
end;
$$;

create trigger trg_dispatch_notification
  after insert on notifications
  for each row execute function dispatch_notification_via_pg_net();
