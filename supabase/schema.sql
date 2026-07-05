-- ============================================================
-- Tandem — Supabase Schema + RLS Policies
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================
--
-- ID conventions (per table):
--   internal_id  bigint GENERATED ALWAYS AS IDENTITY — simple counter (1, 2, 3 …),
--                never exposed outside the DB.
--
--   all tables: id text PK — '<prefix>-<uuid>', e.g. 'usr-a3f2b1c9-…'
--              internal_id bigint identity — simple counter, never exposed.
--
--   profiles.user_id uuid — separate column linking to auth.users(id).
--              FK columns on other tables reference profiles(user_id), not profiles(id),
--              so auth.uid() comparisons in RLS still work.
--                     This is what the app reads and sends over the wire.


-- ─── Extensions ──────────────────────────────────────────────

create extension if not exists "pgcrypto";


-- ─── Tables ──────────────────────────────────────────────────

-- profiles: one row per auth.users row, auto-created by trigger below.
-- user_id is the auth.users UUID used for FK references and RLS checks (auth.uid()).
-- id follows the same 'prefix-uuid' convention as every other table.
create table profiles (
    id           text        primary key default 'usr-' || gen_random_uuid()::text,
    internal_id  bigint      generated always as identity unique,
    user_id      uuid        not null unique references auth.users(id) on delete cascade,
    email        text        not null,
    display_name text        not null,
    avatar_url   text,
    created_at   timestamptz not null default now()
);

-- households: a shared space for a group (couple, family, etc.)
create table households (
    id           text        primary key default 'hh-' || gen_random_uuid()::text,
    internal_id  bigint      generated always as identity unique,
    name         text        not null,
    -- 8-char uppercase hex code, e.g. "A3F2B1C9". Reusable (permanent).
    invite_code  text        not null unique
                             default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
    created_at   timestamptz not null default now()
);

-- household_members: links profiles to households with a role.
-- role 'owner': can delete household and manage invite codes.
-- role 'member': can create/read/update/delete cards, tasks, messages.
create table household_members (
    id           text        primary key default 'hm-' || gen_random_uuid()::text,
    internal_id  bigint      generated always as identity unique,
    household_id text        not null references households(id) on delete cascade,
    user_id      uuid        not null references profiles(user_id) on delete cascade,
    role         text        not null default 'member'
                             check (role in ('owner', 'member')),
    joined_at    timestamptz not null default now(),
    unique (household_id, user_id)
);

-- cards: a responsibility area owned by one household member.
create table cards (
    id            text        primary key default 'card-' || gen_random_uuid()::text,
    internal_id   bigint      generated always as identity unique,
    household_id  text        not null references households(id) on delete cascade,
    name          text        not null,
    owner_id      uuid        references profiles(user_id) on delete restrict,
    note          text,
    strain        text        check (strain in ('light', 'manageable', 'drowning')),
    strain_at     timestamptz,
    is_archived   boolean     not null default false,
    archived_at   timestamptz,
    created_at    timestamptz not null default now()
);

-- tasks: individual to-dos belonging to a card.
--
-- owner_id always mirrors the card's owner_id. The cards_owner_sync trigger
-- below keeps them in sync automatically when a card is reassigned.
--
-- due_date is a simple date for now. Future recurrence can be layered on without
-- changing this column (e.g. a task_recurrence table referencing tasks.id).
create table tasks (
    id           text        primary key default 'task-' || gen_random_uuid()::text,
    internal_id  bigint      generated always as identity unique,
    card_id      text        not null references cards(id) on delete cascade,
    household_id text        not null references households(id) on delete cascade,
    name         text        not null,
    owner_id     uuid        not null references profiles(user_id) on delete restrict,
    due_date     date,
    is_done      boolean     not null default false,
    note         text,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

-- messages: net items — raw thoughts captured, routed to a domain head, triaged.
-- status lifecycle: unrouted → pending → accepted | done | someday | declined
create table messages (
    id             text        primary key default 'msg-' || gen_random_uuid()::text,
    internal_id    bigint      generated always as identity unique,
    household_id   text        not null references households(id) on delete cascade,
    sender_id      uuid        not null references profiles(user_id) on delete restrict,
    receiver_id    uuid        references profiles(user_id) on delete restrict,
    content        text        not null,
    domain_id      text        references cards(id) on delete set null,
    decline_reason text,
    status         text        not null default 'unrouted'
                               check (status in ('unrouted', 'pending', 'accepted', 'done', 'someday', 'declined')),
    created_at     timestamptz not null default now()
);

-- push_tokens: Expo push tokens for each device a user is signed in on.
-- One user can have multiple devices, so this is a separate table.
-- Tokens are unique across the table (a token can only belong to one user).
create table push_tokens (
    id          text        primary key default 'pt-' || gen_random_uuid()::text,
    internal_id bigint      generated always as identity unique,
    user_id     uuid        not null references profiles(user_id) on delete cascade,
    token       text        not null unique,
    created_at  timestamptz not null default now()
);

-- Link tasks back to the inbox message they were created from (nullable).
-- Set when a user taps "convert" on a received message in InboxScreen.
-- ON DELETE SET NULL so deleting a message doesn't delete the task.
alter table tasks
    add column source_message_id text references messages(id) on delete set null;


-- ─── Indexes ─────────────────────────────────────────────────

create index on household_members (household_id);
create index on household_members (user_id);
create index on cards (household_id);
create index on cards (owner_id);
create index on cards (created_at);
create index on tasks (card_id);
create index on tasks (household_id);
create index on tasks (owner_id);
create index on tasks (source_message_id);
create index on messages (household_id);
create index on messages (sender_id);
create index on messages (receiver_id);
create index on messages (domain_id);
create index on push_tokens (user_id);


-- ─── Triggers ────────────────────────────────────────────────

-- Auto-create a profile row whenever a new auth user signs up.
-- ON CONFLICT DO NOTHING makes this idempotent — safe if the trigger fires
-- more than once (e.g. OAuth re-link) or during a manual re-run.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    insert into profiles (user_id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
    )
    on conflict (user_id) do nothing;
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure handle_new_user();


-- Auto-update tasks.updated_at whenever a task row is modified.
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger tasks_updated_at
    before update on tasks
    for each row execute procedure touch_updated_at();


-- When a card's owner changes, cascade the new owner_id to all tasks on that card.
-- IS DISTINCT FROM (not <>) so the claim transition (NULL → owner) fires too.
-- Guard against NULL new.owner_id: tasks.owner_id is NOT NULL, and an unclaimed
-- domain keeps its tasks with the previous head until someone claims it.
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

create trigger cards_owner_sync
    after update of owner_id on cards
    for each row execute procedure sync_task_owners();


-- When a task is moved to a different card, sync owner_id from the new card.
-- This covers the TaskDetailScreen "Card" picker that lets users reassign tasks.
create or replace function sync_task_card_owner()
returns trigger language plpgsql as $$
declare
    new_owner_id uuid;
begin
    if new.card_id <> old.card_id then
        select owner_id into new_owner_id from cards where id = new.card_id;
        new.owner_id := new_owner_id;
    end if;
    return new;
end;
$$;

create trigger tasks_card_owner_sync
    before update of card_id on tasks
    for each row execute procedure sync_task_card_owner();


-- ─── RLS Helper Functions ─────────────────────────────────────

-- Returns true if the current user is a member of the given household.
create or replace function is_household_member(hh_id text)
returns boolean language sql security definer stable as $$
    select exists (
        select 1 from household_members
        where household_id = hh_id
          and user_id = auth.uid()
    );
$$;

-- Returns true if the current user is the owner of the given household.
create or replace function is_household_owner(hh_id text)
returns boolean language sql security definer stable as $$
    select exists (
        select 1 from household_members
        where household_id = hh_id
          and user_id = auth.uid()
          and role = 'owner'
    );
$$;


-- ─── Enable RLS ───────────────────────────────────────────────

alter table profiles          enable row level security;
alter table households        enable row level security;
alter table household_members enable row level security;
alter table cards             enable row level security;
alter table tasks             enable row level security;
alter table messages          enable row level security;
alter table push_tokens       enable row level security;


-- ─── RLS Policies ────────────────────────────────────────────

-- ── profiles ──────────────────────────────────────────────────

-- Any authenticated user can read any profile.
-- (Needed to display partner names/avatars across the app.)
create policy "profiles: read any"
    on profiles for select
    to authenticated
    using (true);

-- Users can only insert/update/delete their own profile row.
create policy "profiles: insert own"
    on profiles for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "profiles: update own"
    on profiles for update
    to authenticated
    using (user_id = auth.uid());

create policy "profiles: delete own"
    on profiles for delete
    to authenticated
    using (user_id = auth.uid());


-- ── households ────────────────────────────────────────────────

-- Members can read their household.
create policy "households: members can read"
    on households for select
    to authenticated
    using (is_household_member(id));

-- Any authenticated user can create a household.
-- (They are added as owner via the create_household RPC below.)
create policy "households: authenticated can create"
    on households for insert
    to authenticated
    with check (true);

-- Only the household owner can update (rename, regenerate invite code, etc.)
create policy "households: owner can update"
    on households for update
    to authenticated
    using (is_household_owner(id));

-- Only the household owner can delete the household.
create policy "households: owner can delete"
    on households for delete
    to authenticated
    using (is_household_owner(id));


-- ── household_members ─────────────────────────────────────────

-- Members can see all members of their shared household.
create policy "household_members: members can read"
    on household_members for select
    to authenticated
    using (is_household_member(household_id));

-- No INSERT policy on household_members is intentional.
-- With RLS enabled and no INSERT policy, direct inserts are blocked by default.
-- All membership creation goes through the create_household / join_household RPCs
-- which run as security definer and bypass RLS. This prevents users from adding
-- themselves (or others) to arbitrary households by guessing a household_id.

-- Owner can change member roles.
create policy "household_members: owner can update"
    on household_members for update
    to authenticated
    using (is_household_owner(household_id));

-- Owner can remove members; any member can remove themselves.
create policy "household_members: owner or self can delete"
    on household_members for delete
    to authenticated
    using (is_household_owner(household_id) or user_id = auth.uid());


-- ── cards ─────────────────────────────────────────────────────

-- All household members can read, create, and update any card.
create policy "cards: members can read"
    on cards for select
    to authenticated
    using (is_household_member(household_id));

create policy "cards: members can insert"
    on cards for insert
    to authenticated
    with check (is_household_member(household_id));

create policy "cards: members can update"
    on cards for update
    to authenticated
    using (is_household_member(household_id));

-- Only the card's own owner can delete it.
-- (Not even household owners can delete another member's card.)
-- The head can delete their own card; unclaimed cards (no head) can be
-- deleted by any household member (e.g. during the deal/swipe flow).
create policy "cards: owner can delete"
    on cards for delete
    to authenticated
    using (owner_id = auth.uid() or (owner_id is null and is_household_member(household_id)));


-- ── tasks ─────────────────────────────────────────────────────

-- All household members can fully manage tasks.
create policy "tasks: members can read"
    on tasks for select
    to authenticated
    using (is_household_member(household_id));

create policy "tasks: members can insert"
    on tasks for insert
    to authenticated
    with check (is_household_member(household_id));

create policy "tasks: members can update"
    on tasks for update
    to authenticated
    using (is_household_member(household_id));

create policy "tasks: members can delete"
    on tasks for delete
    to authenticated
    using (is_household_member(household_id));


-- ── messages ──────────────────────────────────────────────────

-- All household members can read all messages in their household.
create policy "messages: members can read"
    on messages for select
    to authenticated
    using (is_household_member(household_id));

-- Only the sender can create a message (and must be sending as themselves).
create policy "messages: sender can insert"
    on messages for insert
    to authenticated
    with check (is_household_member(household_id) and sender_id = auth.uid());

-- The sender or receiver can update the status (convert, dismiss, archive).
create policy "messages: sender or receiver can update"
    on messages for update
    to authenticated
    using (sender_id = auth.uid() or receiver_id = auth.uid());

-- The sender can delete a message; use status for soft archival.
create policy "messages: sender can delete"
    on messages for delete
    to authenticated
    using (sender_id = auth.uid());


-- ── push_tokens ───────────────────────────────────────────────

-- Users can only read, register, and remove their own device tokens.
create policy "push_tokens: read own"
    on push_tokens for select
    to authenticated
    using (user_id = auth.uid());

create policy "push_tokens: insert own"
    on push_tokens for insert
    to authenticated
    with check (user_id = auth.uid());

create policy "push_tokens: delete own"
    on push_tokens for delete
    to authenticated
    using (user_id = auth.uid());


-- ─── RPC Functions ───────────────────────────────────────────

-- create_household: creates a household and adds the caller as owner atomically.
-- Use this instead of inserting into households directly.
create or replace function create_household(household_name text)
returns text language plpgsql security definer set search_path = public as $$
declare
    new_household_id text;
begin
    insert into households (name)
    values (household_name)
    returning id into new_household_id;

    insert into household_members (household_id, user_id, role)
    values (new_household_id, auth.uid(), 'owner');

    return new_household_id;
end;
$$;

-- join_household: looks up a household by invite_code and adds the caller as member.
-- Returns the household id, or raises an error if the code is invalid.
-- Idempotent — calling it again when already a member is safe.
create or replace function join_household(code text)
returns text language plpgsql security definer set search_path = public as $$
declare
    found_household_id text;
begin
    select id into found_household_id
    from households
    where invite_code = upper(trim(code));

    if found_household_id is null then
        raise exception 'Invalid invite code';
    end if;

    insert into household_members (household_id, user_id, role)
    values (found_household_id, auth.uid(), 'member')
    on conflict (household_id, user_id) do nothing;

    return found_household_id;
end;
$$;

-- regenerate_invite_code: generates a new invite code for a household.
-- Only callable by the household owner.
create or replace function regenerate_invite_code(hh_id text)
returns text language plpgsql security definer set search_path = public as $$
declare
    new_code text;
begin
    if not is_household_owner(hh_id) then
        raise exception 'Only the household owner can regenerate the invite code';
    end if;

    new_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    update households set invite_code = new_code where id = hh_id;

    return new_code;
end;
$$;
