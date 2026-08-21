-- The original settlements_update policy only let the non-initiator move a
-- pending settlement to confirmed/declined — it left the initiator with no
-- way to cancel their own proposal. Split into two policies: the initiator
-- may only cancel; the non-initiator may only confirm or decline.

drop policy if exists settlements_update on settlements;

create policy settlements_update_by_initiator on settlements for update
  using (is_tally_member(tally_id) and auth.uid() = initiated_by and status = 'pending')
  with check (status = 'cancelled');

create policy settlements_update_by_other on settlements for update
  using (is_tally_member(tally_id) and auth.uid() <> initiated_by and status = 'pending')
  with check (status in ('confirmed', 'declined'));
