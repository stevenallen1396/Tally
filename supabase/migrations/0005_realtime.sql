-- Enables Supabase Realtime (postgres_changes) on the tables the client
-- subscribes to for live balance/history updates.
alter publication supabase_realtime add table entries;
alter publication supabase_realtime add table tally_members;
alter publication supabase_realtime add table settlements;
alter publication supabase_realtime add table notifications;
