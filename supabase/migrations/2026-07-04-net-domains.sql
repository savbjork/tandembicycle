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

-- Task-owner sync must fire on the claim transition (NULL → owner); <> is
-- NULL-blind. Guard NULL new.owner_id: tasks.owner_id is NOT NULL, and an
-- unclaimed domain keeps its tasks with the previous head until claimed.
create or replace function sync_task_owners()
returns trigger language plpgsql as $$
begin
    if new.owner_id is distinct from old.owner_id and new.owner_id is not null then
        update tasks set owner_id = new.owner_id
        where card_id = new.id;
    end if;
    return new;
end;
$$;

-- Unclaimed cards (no head) must be deletable by household members
-- (e.g. during the deal/swipe flow); the old policy could never match NULL.
drop policy "cards: owner can delete" on cards;
create policy "cards: owner can delete"
    on cards for delete
    to authenticated
    using (owner_id = auth.uid() or (owner_id is null and is_household_member(household_id)));

-- Same NULL-guard for the move-task-to-card sync: tasks.owner_id is NOT NULL;
-- moving a task onto an unclaimed card keeps the current owner instead of erroring.
create or replace function sync_task_card_owner()
returns trigger language plpgsql as $$
declare
    new_owner_id uuid;
begin
    if new.card_id <> old.card_id then
        select owner_id into new_owner_id from cards where id = new.card_id;
        if new_owner_id is not null then
            new.owner_id := new_owner_id;
        end if;
    end if;
    return new;
end;
$$;
