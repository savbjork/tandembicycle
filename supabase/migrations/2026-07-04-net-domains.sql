-- ============================================================
-- Net & Heads of Responsibility migration
-- Run in the Supabase SQL editor AFTER the base schema.
-- ============================================================

-- Domains may be unclaimed (no head).
alter table cards alter column owner_id drop not null;

-- Strain: the head's self-reported load. The one signal that crosses the wall.
alter table cards add column strain text
    check (strain in ('light', 'manageable', 'drowning'));
alter table cards add column strain_at timestamptz;

-- messages become net items.
alter table messages alter column receiver_id drop not null;
alter table messages add column domain_id text references cards(id) on delete set null;
alter table messages add column decline_reason text;
create index on messages (domain_id);

-- Map legacy statuses to the net lifecycle, then tighten the check.
alter table messages drop constraint messages_status_check;
update messages set status = 'unrouted' where status = 'pending' and domain_id is null;
update messages set status = 'accepted' where status = 'converted';
update messages set status = 'declined' where status = 'dismissed';
update messages set status = 'done'     where status = 'archived';
alter table messages add constraint messages_status_check
    check (status in ('unrouted', 'pending', 'accepted', 'done', 'someday', 'declined'));
alter table messages alter column status set default 'unrouted';

-- The capturer must be able to route (set domain/receiver) after insert,
-- and the head must be able to triage. Replace the update policy.
drop policy "messages: sender or receiver can update" on messages;
create policy "messages: sender or receiver can update"
    on messages for update
    to authenticated
    using (sender_id = auth.uid() or receiver_id = auth.uid());
