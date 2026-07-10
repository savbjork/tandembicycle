# The Net & Heads of Responsibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-plumb Tandem from a measurement tool (weighted card balance) into a relief valve: capture raw thoughts into the Net, route them to the single head of a domain, triage privately, with strain self-ratings as the only cross-partner signal.

**Architecture:** The existing `Card`/`Task`/`DropZoneItem` model evolves in place — `Card` gains optional head + strain (owner becomes nullable = unclaimed), `DropZoneItem` becomes `NetItem` with a six-status lifecycle, and all pure logic (status transitions, visibility selectors) lives in a new tested module `src/features/net/logic/`. Screens rework: Inbox → Net, Cards → Domains, BalanceMeter and frequency weights removed.

**Tech Stack:** React Native 0.81 + Expo 54, TypeScript strict, Zustand, Supabase, NativeWind. New: Jest + ts-jest for pure-logic tests only (no RN component tests).

**Spec:** `docs/plans/2026-07-04-net-domains-design.md`

**Conventions for this plan:**
- Code keeps the `Card` symbol (UI strings say "Domain"); `DropZoneItem` IS renamed to `NetItem` in code.
- `card.owner === undefined` means unclaimed. `owner` present = that person is the head.
- `NetItem.domain` stores the card *name* (matching the `task.card` idiom); Supabase stores `domain_id`.
- All commands run from `tandem-mobile/` unless noted. After every task: `npx tsc --noEmit` must pass.
- One spec refinement: legacy `pending` messages have no domain, so they migrate to `unrouted` (the spec's `pending → pending` mapping would make them invisible to every selector).

---

### Task 1: Jest infrastructure for pure-logic tests

**Files:**
- Create: `tandem-mobile/jest.config.js`
- Modify: `tandem-mobile/package.json` (scripts + devDependencies)

- [ ] **Step 1: Install dev dependencies**

```bash
npm install --save-dev jest ts-jest @types/jest
```

- [ ] **Step 2: Create jest.config.js**

```js
/** Pure-logic tests only (plain .ts, node env). No React Native rendering. */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@store$': '<rootDir>/src/store',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
  },
};
```

- [ ] **Step 3: Add test script to package.json**

In `"scripts"`, add: `"test": "jest"`

- [ ] **Step 4: Verify jest runs (zero tests is success for now)**

Run: `npx jest --passWithNoTests`
Expected: "No tests found, exiting with code 0"

- [ ] **Step 5: Commit**

```bash
git add jest.config.js package.json package-lock.json
git commit -m "chore: add jest + ts-jest for pure-logic tests"
```

---

### Task 2: Domain/NetItem types + pure logic module (TDD)

**Files:**
- Modify: `tandem-mobile/src/shared/data/FakeDataStore.ts` (full replacement below)
- Create: `tandem-mobile/src/features/net/logic/netItemLogic.ts`
- Test: `tandem-mobile/src/features/net/logic/__tests__/netItemLogic.test.ts`

Note: replacing FakeDataStore types will break compilation of dependent files. Tasks 3–5 fix them. Within THIS task, only the logic module and its tests must pass (`npx jest`); defer `tsc --noEmit` to end of Task 5.

- [ ] **Step 1: Replace FakeDataStore.ts contents entirely**

```ts
// ─── Domain Types ────────────────────────────────────────────

export type Person = string;

export type DomainStrain = 'light' | 'manageable' | 'drowning';

// A Card is a domain of responsibility. `owner` is the domain's head;
// undefined means the domain is unclaimed.
export interface Card {
  dbId?: string;
  name: string;
  owner?: Person;
  note?: string;
  strain?: DomainStrain;
  strainAt?: string; // ISO timestamp of last strain self-rating
}

export interface Task {
  id: string;
  name: string;
  card: string;
  owner: Person;
  dueDate: string;
  isDone: boolean;
  note?: string;
}

// NetItem lifecycle:
//   unrouted → pending → accepted | done | someday | declined
//   declined → pending (re-route)   someday → accepted | done
export type NetItemStatus =
  | 'unrouted'
  | 'pending'
  | 'accepted'
  | 'done'
  | 'someday'
  | 'declined';

export interface NetItem {
  id: string;
  capturer: Person;
  content: string;
  domain?: string; // card name, set at routing
  status: NetItemStatus;
  declineReason?: string;
  createdAt: Date;
}

// ─── Fake Data Store ─────────────────────────────────────────

class FakeDataStore {
  cards: Card[] = [];
  tasks: Task[] = [];
  netItems: NetItem[] = [];
}

// Singleton instance — shared across all screens
export const fakeData = new FakeDataStore();
```

- [ ] **Step 2: Write the failing tests**

Create `src/features/net/logic/__tests__/netItemLogic.test.ts`:

```ts
import type { Card, NetItem, Task } from '@shared/data/FakeDataStore';
import {
  canTransition,
  isHead,
  selectUnrouted,
  selectTriage,
  selectReturned,
  selectSomedayForDomain,
  selectVisibleTasks,
  domainsNeedingStrainCheck,
} from '../netItemLogic';

const cards: Card[] = [
  { name: 'Groceries', owner: 'Sam' },
  { name: 'Kids Health', owner: 'Alex' },
  { name: 'Yard', owner: undefined }, // unclaimed
];

const item = (over: Partial<NetItem>): NetItem => ({
  id: 'n1',
  capturer: 'Sam',
  content: 'kids need shoes',
  status: 'unrouted',
  createdAt: new Date('2026-07-01'),
  ...over,
});

describe('canTransition', () => {
  it('allows the legal lifecycle moves', () => {
    expect(canTransition('unrouted', 'pending')).toBe(true);
    expect(canTransition('pending', 'accepted')).toBe(true);
    expect(canTransition('pending', 'done')).toBe(true);
    expect(canTransition('pending', 'someday')).toBe(true);
    expect(canTransition('pending', 'declined')).toBe(true);
    expect(canTransition('declined', 'pending')).toBe(true);
    expect(canTransition('someday', 'accepted')).toBe(true);
    expect(canTransition('someday', 'done')).toBe(true);
  });
  it('rejects illegal moves', () => {
    expect(canTransition('unrouted', 'accepted')).toBe(false);
    expect(canTransition('accepted', 'pending')).toBe(false);
    expect(canTransition('done', 'pending')).toBe(false);
    expect(canTransition('unrouted', 'declined')).toBe(false);
  });
});

describe('isHead', () => {
  it('true only for the owner', () => {
    expect(isHead(cards[0], 'Sam')).toBe(true);
    expect(isHead(cards[0], 'Alex')).toBe(false);
  });
  it('false for unclaimed domains, whoever asks', () => {
    expect(isHead(cards[2], 'Sam')).toBe(false);
  });
});

describe('selectors — the visibility wall', () => {
  const items: NetItem[] = [
    item({ id: 'a', capturer: 'Sam', status: 'unrouted' }),
    item({ id: 'b', capturer: 'Sam', status: 'pending', domain: 'Kids Health' }),
    item({ id: 'c', capturer: 'Alex', status: 'pending', domain: 'Groceries' }),
    item({ id: 'd', capturer: 'Sam', status: 'declined', domain: 'Kids Health', declineReason: 'camp is your call' }),
    item({ id: 'e', capturer: 'Alex', status: 'someday', domain: 'Groceries' }),
    item({ id: 'f', capturer: 'Alex', status: 'unrouted' }),
  ];

  it('selectUnrouted: only my own captures', () => {
    expect(selectUnrouted(items, 'Sam').map((i) => i.id)).toEqual(['a']);
  });

  it('selectTriage: only pending items in domains I head', () => {
    expect(selectTriage(items, cards, 'Sam').map((i) => i.id)).toEqual(['c']);
    expect(selectTriage(items, cards, 'Alex').map((i) => i.id)).toEqual(['b']);
  });

  it('selectReturned: only my declined captures', () => {
    expect(selectReturned(items, 'Sam').map((i) => i.id)).toEqual(['d']);
    expect(selectReturned(items, 'Alex')).toEqual([]);
  });

  it('selectSomedayForDomain: someday pile per domain', () => {
    expect(selectSomedayForDomain(items, 'Groceries').map((i) => i.id)).toEqual(['e']);
  });

  it('selectVisibleTasks: never returns a partner task', () => {
    const tasks: Task[] = [
      { id: 't1', name: 'buy milk', card: 'Groceries', owner: 'Sam', dueDate: '', isDone: false },
      { id: 't2', name: 'book dr', card: 'Kids Health', owner: 'Alex', dueDate: '', isDone: false },
    ];
    expect(selectVisibleTasks(tasks, 'Sam').map((t) => t.id)).toEqual(['t1']);
  });
});

describe('domainsNeedingStrainCheck', () => {
  const now = new Date('2026-07-04T12:00:00Z');
  it('flags my domains never rated or rated over 7 days ago', () => {
    const myCards: Card[] = [
      { name: 'A', owner: 'Sam' }, // never rated
      { name: 'B', owner: 'Sam', strain: 'light', strainAt: '2026-06-20T00:00:00Z' }, // stale
      { name: 'C', owner: 'Sam', strain: 'light', strainAt: '2026-07-02T00:00:00Z' }, // fresh
      { name: 'D', owner: 'Alex', strain: undefined }, // not mine
      { name: 'E', owner: undefined }, // unclaimed
    ];
    expect(domainsNeedingStrainCheck(myCards, 'Sam', now).map((c) => c.name)).toEqual(['A', 'B']);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest netItemLogic`
Expected: FAIL — cannot find module '../netItemLogic'

- [ ] **Step 4: Implement netItemLogic.ts**

Create `src/features/net/logic/netItemLogic.ts`:

```ts
import type { Card, NetItem, NetItemStatus, Person, Task } from '@shared/data/FakeDataStore';

// Legal lifecycle moves. Anything not listed is forbidden — items never
// silently die, and finished items never come back.
const TRANSITIONS: Record<NetItemStatus, NetItemStatus[]> = {
  unrouted: ['pending'],
  pending: ['accepted', 'done', 'someday', 'declined'],
  declined: ['pending'],
  someday: ['accepted', 'done'],
  accepted: [],
  done: [],
};

export const canTransition = (from: NetItemStatus, to: NetItemStatus): boolean =>
  TRANSITIONS[from].includes(to);

export const isHead = (card: Card, person: Person): boolean => card.owner === person;

export const selectUnrouted = (items: NetItem[], me: Person): NetItem[] =>
  items.filter((i) => i.capturer === me && i.status === 'unrouted');

export const selectTriage = (items: NetItem[], cards: Card[], me: Person): NetItem[] =>
  items.filter((i) => {
    if (i.status !== 'pending' || !i.domain) return false;
    const card = cards.find((c) => c.name === i.domain);
    return card !== undefined && isHead(card, me);
  });

export const selectReturned = (items: NetItem[], me: Person): NetItem[] =>
  items.filter((i) => i.capturer === me && i.status === 'declined');

export const selectSomedayForDomain = (items: NetItem[], domain: string): NetItem[] =>
  items.filter((i) => i.status === 'someday' && i.domain === domain);

export const selectVisibleTasks = (tasks: Task[], me: Person): Task[] =>
  tasks.filter((t) => t.owner === me);

const STRAIN_STALE_MS = 7 * 24 * 60 * 60 * 1000;

export const domainsNeedingStrainCheck = (cards: Card[], me: Person, now: Date): Card[] =>
  cards.filter((c) => {
    if (c.owner !== me) return false;
    if (!c.strainAt) return true;
    return now.getTime() - new Date(c.strainAt).getTime() > STRAIN_STALE_MS;
  });
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest netItemLogic`
Expected: PASS, 8 tests

- [ ] **Step 6: Commit**

```bash
git add src/shared/data/FakeDataStore.ts src/features/net/
git commit -m "feat: NetItem/Domain types and tested net lifecycle logic"
```

---

### Task 3: Supabase migration + schema.sql update

**Files:**
- Create: `supabase/migrations/2026-07-04-net-domains.sql` (repo root, new directory)
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Write the migration file**

```sql
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
```

(The recreated policy is identical — kept explicit so the file documents that routing/triage rely on it: capturer = sender routes; head = receiver triages.)

- [ ] **Step 2: Update schema.sql to match** (so a fresh install matches a migrated one)

In `supabase/schema.sql`:
- `cards`: change `owner_id uuid not null references …` → `owner_id uuid references profiles(user_id) on delete restrict`; delete the `frequency` column definition lines; add after `note text,`:
  ```sql
  strain        text        check (strain in ('light', 'manageable', 'drowning')),
  strain_at     timestamptz,
  ```
- `messages`: change `receiver_id` to drop `not null`; add `domain_id text references cards(id) on delete set null,` and `decline_reason text,`; replace the status line with:
  ```sql
  status       text        not null default 'unrouted'
                           check (status in ('unrouted', 'pending', 'accepted', 'done', 'someday', 'declined')),
  ```
- Update the comment above `messages` to: `-- messages: net items — raw thoughts captured, routed to a domain head, triaged.` and the lifecycle comment to `-- status lifecycle: unrouted → pending → accepted | done | someday | declined`.
- Add `create index on messages (domain_id);` to the indexes section.

Note: keep the `frequency` column REMOVED from schema.sql but do NOT drop it in the migration — existing databases keep the dead column (non-destructive), fresh installs never create it. The app writes neither.

- [ ] **Step 3: Apply the migration to the dev Supabase project**

Run the contents of `supabase/migrations/2026-07-04-net-domains.sql` in the Supabase SQL editor (Dashboard → SQL Editor). Expected: "Success. No rows returned" (or row counts from the UPDATE statements).

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: net-domains schema migration (nullable head, strain, net item lifecycle)"
```

---

### Task 4: dataStore rework — net actions, strain persistence, frequency removal

**Files:**
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`
- Modify: `tandem-mobile/src/app/providers/DataInitializer.tsx`

- [ ] **Step 1: Rework dataStore.ts**

Replace the imports and the drop-zone section; update card/reset actions. The full set of changes:

1. Import block: replace `type DropZoneItem, type DropZoneItemStatus` with `type NetItem, type NetItemStatus`; add `import { canTransition } from '@features/net/logic/netItemLogic';`
2. State interface: replace `dropZoneItems: DropZoneItem[]` with `netItems: NetItem[]`, and replace the four Drop Zone action signatures with:

```ts
  // ── Net Actions ───────────────────────────────────────
  addNetItem: (item: NetItem) => void;
  routeNetItem: (id: string, domainName: string) => void;
  triageNetItem: (id: string, outcome: 'accepted' | 'done' | 'someday') => void;
  declineNetItem: (id: string, reason: string) => void;
  removeNetItem: (id: string) => void;
  setNetItems: (items: NetItem[]) => void;
```

3. Store init: `netItems: [...fakeData.netItems],` (remove `dropZoneItems` line).
4. Replace the whole `── Drop Zone Actions ──` block with:

```ts
  // ── Net Actions ───────────────────────────────────────────

  addNetItem: (item) => {
    set((state) => {
      const newItems = [item, ...state.netItems];
      fakeData.netItems = newItems;
      return { netItems: newItems };
    });

    const { householdId, userIdByName } = get();
    const capturerId = userIdByName[item.capturer];
    if (!householdId || !capturerId) return;

    supabase
      .from('messages')
      .insert({
        household_id: householdId,
        sender_id: capturerId,
        receiver_id: null,
        content: item.content,
        status: 'unrouted',
      })
      .select('id')
      .single()
      .then(({ data }) => {
        if (!data?.id) return;
        set((state) => {
          const newItems = state.netItems.map((i) =>
            i.id === item.id ? { ...i, id: data.id } : i
          );
          fakeData.netItems = newItems;
          return { netItems: newItems };
        });
      });
  },

  routeNetItem: (id, domainName) => {
    const { netItems, cards, userIdByName } = get();
    const item = netItems.find((i) => i.id === id);
    const card = cards.find((c) => c.name === domainName);
    // Routing requires a claimed domain; unclaimed domains can't triage.
    if (!item || !card?.owner || !canTransition(item.status, 'pending')) return;

    set((state) => {
      const newItems = state.netItems.map((i) =>
        i.id === id ? { ...i, domain: domainName, status: 'pending' as NetItemStatus } : i
      );
      fakeData.netItems = newItems;
      return { netItems: newItems };
    });

    const headId = card.owner ? userIdByName[card.owner] : null;
    supabase
      .from('messages')
      .update({ domain_id: card.dbId ?? null, receiver_id: headId, status: 'pending' })
      .eq('id', id);
  },

  triageNetItem: (id, outcome) => {
    const item = get().netItems.find((i) => i.id === id);
    if (!item || !canTransition(item.status, outcome)) return;

    set((state) => {
      const newItems = state.netItems.map((i) => (i.id === id ? { ...i, status: outcome } : i));
      fakeData.netItems = newItems;
      return { netItems: newItems };
    });

    supabase.from('messages').update({ status: outcome }).eq('id', id);
  },

  declineNetItem: (id, reason) => {
    const item = get().netItems.find((i) => i.id === id);
    if (!item || !canTransition(item.status, 'declined')) return;

    set((state) => {
      const newItems = state.netItems.map((i) =>
        i.id === id ? { ...i, status: 'declined' as NetItemStatus, declineReason: reason } : i
      );
      fakeData.netItems = newItems;
      return { netItems: newItems };
    });

    supabase.from('messages').update({ status: 'declined', decline_reason: reason }).eq('id', id);
  },

  removeNetItem: (id) =>
    set((state) => {
      const newItems = state.netItems.filter((item) => item.id !== id);
      fakeData.netItems = newItems;

      supabase.from('messages').delete().eq('id', id);

      return { netItems: newItems };
    }),

  setNetItems: (items) =>
    set(() => {
      fakeData.netItems = [...items];
      return { netItems: [...items] };
    }),
```

5. `addCard`: remove `frequency: card.frequency,` from the insert payload; change `owner_id: ownerId` to allow unclaimed: replace the guard + payload with:

```ts
    const { householdId, userIdByName } = get();
    const ownerId = card.owner ? userIdByName[card.owner] : null;
    if (!householdId) return;

    supabase
      .from('cards')
      .insert({
        household_id: householdId,
        name: card.name,
        owner_id: ownerId,
        note: card.note ?? null,
      })
```

   and in the dbId back-fill matcher, keep `c.name === card.name && c.owner === card.owner && !c.dbId` as-is (works with undefined owner).
6. `updateCard`: replace the `dbUpdates` block with:

```ts
        const dbUpdates: Record<string, unknown> = {};
        if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
        if (updates.strain !== undefined) {
          dbUpdates.strain = updates.strain ?? null;
          dbUpdates.strain_at = updates.strainAt ?? new Date().toISOString();
        }
        if (updates.owner !== undefined) {
          const { userIdByName } = get();
          dbUpdates.owner_id = updates.owner ? (userIdByName[updates.owner] ?? null) : null;
        }
```

7. `reassignCards`: after the local `set`, add Supabase persistence (this also fixes claiming):

```ts
    // Persist new heads
    const { userIdByName, cards: allCards } = get();
    assignments.forEach(({ name, owner }) => {
      const card = allCards.find((c) => c.name === name);
      const ownerId = userIdByName[owner];
      if (card?.dbId && ownerId) {
        supabase.from('cards').update({ owner_id: ownerId }).eq('id', card.dbId);
      }
    });
```

   (Place it after the `set(...)` call inside `reassignCards`, converting it from an arrow-return `set` to a body with `set` then the loop.)
8. `resetToDefaults`: remove `frequency: card.frequency,` from the insert payload; change `const ownerId = userIdByName[card.owner]; if (!ownerId) continue;` to `const ownerId = card.owner ? userIdByName[card.owner] : null;` and pass `owner_id: ownerId`.

- [ ] **Step 2: Update DataInitializer.tsx**

- Import change: `import type { Card, Task, NetItem } from '@shared/data/FakeDataStore';` (drop `DropZoneItem`, `CardFrequency`).
- Store destructure: `setNetItems` instead of `setDropZoneItems`.
- Cards mapping: wherever a `Card` is built from a row, map `owner: m.owner_id ? nameByUserId[m.owner_id] : undefined`, drop `frequency`, and add `strain: row.strain ?? undefined, strainAt: row.strain_at ?? undefined`.
- Messages mapping: replace the `dropZoneItems` mapping with (using the cards fetched earlier in the same effect to resolve names):

```ts
      const netItems: NetItem[] = (messagesData ?? []).map((m) => ({
        id: m.id,
        capturer: nameByUserId[m.sender_id] ?? 'Unknown',
        content: m.content,
        domain: m.domain_id
          ? (cardsData ?? []).find((c) => c.id === m.domain_id)?.name
          : undefined,
        status: m.status as NetItem['status'],
        declineReason: m.decline_reason ?? undefined,
        createdAt: new Date(m.created_at),
      }));
      setNetItems(netItems);
```

  Also add `domain_id, decline_reason` (and `strain, strain_at` on the cards query) to the `.select(...)` column lists if they are explicit.
- Update the effect dependency array: `setDropZoneItems` → `setNetItems`.

- [ ] **Step 3: Verify the logic tests still pass**

Run: `npx jest`
Expected: PASS (tsc will still fail until Task 5 — that's expected)

- [ ] **Step 4: Commit**

```bash
git add src/store/slices/dataStore.ts src/app/providers/DataInitializer.tsx
git commit -m "feat: net actions in dataStore, strain/head persistence, frequency removed"
```

---

### Task 5: Remove BalanceMeter + frequency UI; compile clean

**Files:**
- Delete: `tandem-mobile/src/features/cards/components/BalanceMeter.tsx`
- Modify: `src/features/cards/screens/CardsScreen.tsx`, `src/features/cards/screens/CardDetailScreen.tsx`, `src/features/cards/components/CardListItem.tsx`, `src/features/cards/components/AddCardModal.tsx`, `src/features/cards/components/CardFilterSheet.tsx`, `src/features/cards/hooks/useCardsFiltering.ts`, `src/features/cards/hooks/useCardsFilterPreferences.ts`, `src/features/cards/hooks/useCardShuffle.ts`, `src/features/cards/index.ts`

- [ ] **Step 1: Delete BalanceMeter and purge frequency**

```bash
rm src/features/cards/components/BalanceMeter.tsx
grep -rn "BalanceMeter\|frequency\|Frequency\|FREQUENCY" src/
```

Fix every hit, guided by `npx tsc --noEmit`:
- `CardsScreen.tsx`: remove the `BalanceMeter` import and the `{filter === 'all' && (<BalanceMeter …/>)}` block from `listHeader`; remove `frequencyFilter` from the `useCardsFilterPreferences` destructure, the `useCardsFiltering` args, the filter-active dot condition, and the `<CardFilterSheet>` props.
- `CardDetailScreen.tsx`: remove the frequency segmented-control block and any `CardFrequency` import; leave the surrounding layout intact (the strain selector replaces it in Task 8).
- `CardListItem.tsx`: remove the frequency-based background/border tint; use static `bg-surface` / `border-border-light` (selection override stays).
- `AddCardModal.tsx`: remove any frequency field/state; new cards are created without it.
- `CardFilterSheet.tsx`: remove the frequency filter section and its props.
- `useCardsFiltering.ts` / `useCardsFilterPreferences.ts`: remove `frequencyFilter` from prefs shape, defaults, persistence, and filtering logic.
- `useCardShuffle.ts`: remove `frequency` from any default-card seed objects.
- `src/features/cards/index.ts`: remove the BalanceMeter export if present.

- [ ] **Step 2: Fix owner-optional fallout**

`card.owner` is now `Person | undefined`. Run `npx tsc --noEmit` and fix each remaining error with these rules:
- Comparisons like `c.owner === currentUser` are fine as-is (undefined never equals a name).
- Anywhere `card.owner` is rendered as text (e.g. OwnerBadge), render `card.owner ?? 'Unclaimed'`.
- `useCardsFiltering`: filter `'mine'` → `c.owner === currentUser`; `'partner'` → `c.owner !== undefined && c.owner !== currentUser`; `'all'` → include all (unclaimed included).
- `SwipeModeScreen` / `useCardShuffle`: assignment always sets a concrete owner — no change needed beyond types.

- [ ] **Step 3: Verify compile + tests + lint**

```bash
npx tsc --noEmit && npx jest && npm run lint
```
Expected: all pass. This is the first fully-compiling commit of the new model.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: remove BalanceMeter and frequency weights; owner becomes optional head"
```

---

### Task 6: NetScreen (replaces InboxScreen)

**Files:**
- Create: `tandem-mobile/src/features/net/screens/NetScreen.tsx`
- Create: `tandem-mobile/src/features/net/index.ts` (`export { NetScreen } from './screens/NetScreen';`)
- Modify: `src/app/navigation/MainNavigator.tsx`, `src/app/navigation/stacks/MainStackNavigator.tsx` (swap InboxScreen → NetScreen; tab label "Net", icon stays `mail` or use `archive`)
- Delete (after swap): `src/features/inbox/` directory
- Modify: `src/shared/components/ui/AddTaskSheet.tsx` — add optional `initialCard?: string` prop that pre-selects the card in its picker

- [ ] **Step 1: Create NetScreen.tsx**

```tsx
import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, BottomSheet, ScreenHeader, FieldLabel, TextInput } from '@shared/components/ui';
import { AddTaskSheet } from '@shared/components/ui/AddTaskSheet';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import type { NetItem } from '@shared/data/FakeDataStore';
import {
  selectUnrouted,
  selectTriage,
  selectReturned,
} from '@features/net/logic/netItemLogic';
import { formatRelativeTime } from '@shared/utils/date';
import { useNavigation } from '@react-navigation/native';

export const NetScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentUser } = useCurrentUser();
  const { cards, netItems, addNetItem, routeNetItem, triageNetItem, declineNetItem, removeNetItem } =
    useDataStore();

  const [captureText, setCaptureText] = useState('');
  const [routingItem, setRoutingItem] = useState<NetItem | null>(null);
  const [decliningItem, setDecliningItem] = useState<NetItem | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [taskFromItem, setTaskFromItem] = useState<NetItem | null>(null);

  const unrouted = useMemo(() => selectUnrouted(netItems, currentUser), [netItems, currentUser]);
  const triage = useMemo(
    () => selectTriage(netItems, cards, currentUser),
    [netItems, cards, currentUser]
  );
  const returned = useMemo(() => selectReturned(netItems, currentUser), [netItems, currentUser]);

  // Recently routed by me — shown faded for a day, then gone. No status beyond this.
  const recentlyCaught = useMemo(
    () =>
      netItems.filter(
        (i) =>
          i.capturer === currentUser &&
          i.status === 'pending' &&
          Date.now() - i.createdAt.getTime() < 24 * 60 * 60 * 1000
      ),
    [netItems, currentUser]
  );

  const claimedDomains = useMemo(() => cards.filter((c) => c.owner), [cards]);

  const handleCapture = () => {
    if (!captureText.trim()) return;
    addNetItem({
      id: `n${Date.now()}`,
      capturer: currentUser,
      content: captureText.trim(),
      status: 'unrouted',
      createdAt: new Date(),
    });
    setCaptureText('');
  };

  const handleDecline = () => {
    if (!decliningItem || !declineReason.trim()) return;
    declineNetItem(decliningItem.id, declineReason.trim());
    setDecliningItem(null);
    setDeclineReason('');
  };

  const handleDismissReturned = (item: NetItem) => {
    Alert.alert('Let it go?', 'This thought will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeNetItem(item.id) },
    ]);
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader title="Net" showBack onBack={() => navigation.goBack()} />

      {/* Capture box — always on top, zero required fields */}
      <View className="px-5 pt-2 pb-4">
        <View className="flex-row items-center bg-surface border border-border rounded-2xl pl-4 pr-2 py-2 gap-2 shadow-sm">
          <TextInput
            className="flex-1 text-base text-text py-1.5"
            placeholder="Get it out of your head…"
            placeholderTextColor={COLORS.text.muted}
            value={captureText}
            onChangeText={setCaptureText}
            multiline
          />
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-xl ${captureText.trim() ? 'bg-primary-600' : 'bg-border'}`}
            disabled={!captureText.trim()}
            onPress={handleCapture}
          >
            <Text className="text-white font-bold text-sm">Catch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* To route */}
        {unrouted.length > 0 && (
          <View className="mb-6">
            <FieldLabel>To route</FieldLabel>
            {unrouted.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm flex-row items-center"
                onPress={() => setRoutingItem(item)}
              >
                <View className="flex-1 mr-3">
                  <Text className="text-base text-text">{item.content}</Text>
                  <Text className="text-[11px] text-text-muted mt-1">
                    {formatRelativeTime(item.createdAt)} • tap to route
                  </Text>
                </View>
                <Ionicons name="arrow-forward-circle-outline" size={22} color={COLORS.primary[600]} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Returned to you */}
        {returned.length > 0 && (
          <View className="mb-6">
            <FieldLabel>Returned to you</FieldLabel>
            {returned.map((item) => (
              <View
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm"
              >
                <Text className="text-base text-text">{item.content}</Text>
                {item.declineReason && (
                  <Text className="text-[13px] text-text-secondary mt-1 italic">
                    “{item.declineReason}”
                  </Text>
                )}
                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    className="bg-primary-600 px-4 py-2 rounded-lg"
                    onPress={() => setRoutingItem(item)}
                  >
                    <Text className="text-white text-sm font-semibold">Re-route</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="px-4 py-2 rounded-lg border border-border"
                    onPress={() => handleDismissReturned(item)}
                  >
                    <Text className="text-text-secondary text-sm font-semibold">Let it go</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Your triage */}
        <View className="mb-6">
          <FieldLabel>Your triage</FieldLabel>
          {triage.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center border border-border-light">
              <Text className="text-sm text-text-secondary">Nothing waiting on you</Text>
            </View>
          ) : (
            triage.map((item) => (
              <View
                key={item.id}
                className="bg-surface rounded-xl p-4 mb-2 border border-border-light shadow-sm"
              >
                <Text className="text-base text-text">{item.content}</Text>
                <Text className="text-[11px] text-text-muted mt-1">
                  {item.domain} • from {item.capturer} • {formatRelativeTime(item.createdAt)}
                </Text>
                <View className="flex-row gap-2 mt-3">
                  <TriageButton label="Task" onPress={() => setTaskFromItem(item)} primary />
                  <TriageButton label="Done" onPress={() => triageNetItem(item.id, 'done')} />
                  <TriageButton label="Someday" onPress={() => triageNetItem(item.id, 'someday')} />
                  <TriageButton label="Decline" onPress={() => setDecliningItem(item)} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recently caught — fading confirmation, no tracking */}
        {recentlyCaught.length > 0 && (
          <View className="mb-6 opacity-60">
            <FieldLabel>Caught</FieldLabel>
            {recentlyCaught.map((item) => (
              <View key={item.id} className="flex-row items-center gap-2 py-1.5">
                <Ionicons name="checkmark-done" size={16} color={COLORS.text.muted} />
                <Text className="text-sm text-text-muted flex-1" numberOfLines={1}>
                  {item.content} → {item.domain}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>

      {/* Route to a domain */}
      <BottomSheet visible={routingItem !== null} onClose={() => setRoutingItem(null)}>
        <Text className="text-xl font-bold text-text mb-2">Route to a domain</Text>
        <Text className="text-sm text-text-secondary mb-4" numberOfLines={2}>
          {routingItem?.content}
        </Text>
        {claimedDomains.map((card) => (
          <TouchableOpacity
            key={card.name}
            className="py-3.5 px-4 rounded-xl bg-surface-dim border border-border mb-2 flex-row justify-between items-center"
            onPress={() => {
              if (routingItem) routeNetItem(routingItem.id, card.name);
              setRoutingItem(null);
            }}
          >
            <Text className="text-base font-medium text-text">{card.name}</Text>
            <Text className="text-[13px] text-text-muted">{card.owner}</Text>
          </TouchableOpacity>
        ))}
        {claimedDomains.length === 0 && (
          <Text className="text-sm text-text-muted">No claimed domains yet.</Text>
        )}
      </BottomSheet>

      {/* Decline with reason */}
      <BottomSheet
        visible={decliningItem !== null}
        onClose={() => {
          setDecliningItem(null);
          setDeclineReason('');
        }}
      >
        <Text className="text-xl font-bold text-text mb-2">Decline</Text>
        <Text className="text-sm text-text-secondary mb-4">
          It goes back to {decliningItem?.capturer} with your reason — nothing silently dies.
        </Text>
        <TextInput
          className="text-base text-text mb-4 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
          placeholder="Why are you bouncing this?"
          placeholderTextColor={COLORS.text.muted}
          value={declineReason}
          onChangeText={setDeclineReason}
          autoFocus
          multiline
        />
        <TouchableOpacity
          className={`py-4 rounded-2xl items-center ${declineReason.trim() ? 'bg-primary-600' : 'bg-border'}`}
          disabled={!declineReason.trim()}
          onPress={handleDecline}
        >
          <Text className="text-white font-bold text-base">Send back</Text>
        </TouchableOpacity>
      </BottomSheet>

      {/* Accept: create a task in this domain */}
      <AddTaskSheet
        visible={taskFromItem !== null}
        onClose={() => setTaskFromItem(null)}
        initialNote={taskFromItem?.content}
        initialCard={taskFromItem?.domain}
        onTaskAdded={() => taskFromItem && triageNetItem(taskFromItem.id, 'accepted')}
      />
    </View>
  );
};

// ─── Triage Button ────────────────────────────────────────────

interface TriageButtonProps {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

const TriageButton: React.FC<TriageButtonProps> = ({ label, onPress, primary }) => (
  <TouchableOpacity
    className={`px-3 py-2 rounded-lg ${primary ? 'bg-primary-600' : 'border border-border'}`}
    onPress={onPress}
  >
    <Text className={`text-[13px] font-semibold ${primary ? 'text-white' : 'text-text-secondary'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);
```

- [ ] **Step 2: Add `initialCard` to AddTaskSheet**

In `src/shared/components/ui/AddTaskSheet.tsx`: add `initialCard?: string` to the props interface, and initialize the sheet's selected-card state from it (`useState(initialCard ?? <existing default>)`; if the sheet resets state on `visible`, seed from `initialCard` there). The created task must land on that card so its owner is the domain head.

- [ ] **Step 3: Swap navigation to NetScreen**

- `MainNavigator.tsx`: replace `InboxScreen` import with `import { NetScreen } from '@features/net';`, swap the component on `InboxTab`, set `tabBarLabel: 'Net'`.
- `MainStackNavigator.tsx`: same swap for the stack's `Inbox` route (keep the route name `Inbox` for now to avoid a `types.ts` cascade; only the component and title change).
- `NavigationRow` (used in CardsScreen): change the inbox label text to "Net" if it renders one.
- Delete the old feature: `rm -rf src/features/inbox` and remove its export from any barrel that references it.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run lint && npx jest
```
Expected: all pass. Then launch (`npm start`, press i) and smoke-test: capture a thought → appears under "To route"; route it to a claimed domain → moves to head's triage (visible if you head it).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: NetScreen — capture, route, triage, decline round-trip"
```

---

### Task 7: Domains screen (CardsScreen rework)

**Files:**
- Modify: `src/features/cards/screens/CardsScreen.tsx`
- Modify: `src/features/cards/components/CardListItem.tsx`

- [ ] **Step 1: Partner rows go plain; strain dot on your rows**

In `CardListItem.tsx`, add props `isHeadView: boolean` (already implied by `showTasks`) and render:
- For your own cards: existing layout plus a strain dot before the name when `card.strain` is set — `bg-success` for `light`, `bg-warning` for `manageable`, `bg-error` for `drowning` (use the closest existing color tokens; check `tailwind.config.js` for exact names and fall back to `COLORS` constants if needed).
- The card's task list and task count only render when the card's owner is the current user (pass `showTasks={taskTimeFilter !== 'hidden' && card.owner === currentUser}` from CardsScreen's `renderItem`).

In `CardsScreen.tsx` `renderItem`, branch:

```tsx
        renderItem={({ item: card }) =>
          card.owner === currentUser || isSelecting ? (
            <CardListItem
              card={card}
              tasks={getCardTasks(card.name)}
              isSelecting={isSelecting}
              isSelected={selectedCardNames.includes(card.name)}
              onPress={() => navigation.navigate('CardDetail', { cardName: card.name })}
              onToggleSelection={() => toggleCardSelection(card.name)}
              showOwnerBadge={filter === 'all'}
              showTasks={taskTimeFilter !== 'hidden' && card.owner === currentUser}
              onToggleTaskDone={(taskId) => handleToggleDone(taskId)}
            />
          ) : card.owner ? (
            <PartnerDomainRow
              card={card}
              onPress={() => navigation.navigate('CardDetail', { cardName: card.name })}
            />
          ) : (
            <UnclaimedDomainRow card={card} onClaim={() => handleClaim(card.name)} />
          )
        }
```

- [ ] **Step 2: Add the two new row components + claim handler** (bottom of CardsScreen.tsx or as siblings in `../components/`; keep one component per file per conventions — create `src/features/cards/components/PartnerDomainRow.tsx` and `src/features/cards/components/UnclaimedDomainRow.tsx`)

`PartnerDomainRow.tsx`:

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { Card } from '@shared/data/FakeDataStore';

interface PartnerDomainRowProps {
  card: Card;
  onPress: () => void;
}

// Partner domains are a closed door: name and head only. No counts, no tasks.
export const PartnerDomainRow: React.FC<PartnerDomainRowProps> = ({ card, onPress }) => (
  <TouchableOpacity
    className="bg-surface rounded-xl px-4 py-3.5 mb-2 border border-border-light flex-row justify-between items-center"
    onPress={onPress}
  >
    <Text className="text-base font-medium text-text">{card.name}</Text>
    <View className="flex-row items-center gap-1.5">
      <Text className="text-[13px] text-text-muted">{card.owner}</Text>
    </View>
  </TouchableOpacity>
);
```

`UnclaimedDomainRow.tsx`:

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { Card } from '@shared/data/FakeDataStore';

interface UnclaimedDomainRowProps {
  card: Card;
  onClaim: () => void;
}

export const UnclaimedDomainRow: React.FC<UnclaimedDomainRowProps> = ({ card, onClaim }) => (
  <View className="bg-surface-dim rounded-xl px-4 py-3.5 mb-2 border border-border border-dashed flex-row justify-between items-center">
    <Text className="text-base font-medium text-text-secondary">{card.name}</Text>
    <TouchableOpacity className="bg-secondary-600 px-4 py-2 rounded-lg" onPress={onClaim}>
      <Text className="text-white text-[13px] font-semibold">Claim</Text>
    </TouchableOpacity>
  </View>
);
```

Claim handler in CardsScreen (uses existing `reassignCards`, which now persists):

```tsx
  const handleClaim = (name: string) => {
    reassignCards([{ name, owner: currentUser }]);
  };
```

Sort order so unclaimed domains surface: in the `filteredCards` consumption, order mine → unclaimed → partner (add a `useMemo` sort by `card.owner === currentUser ? 0 : card.owner ? 2 : 1` before passing to `FlatList`).

- [ ] **Step 3: Rename UI strings**

- `ScreenHeader title`: `'Cards'` → `'Domains'`, `'Select Cards'` → `'Select Domains'`.
- Empty-search copy: `'No cards match your search'` → `'No domains match your search'`.
- `AddCardModal` heading text: "card" → "domain" wherever user-visible.

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Then in the simulator: partner's domains render as plain rows without task counts; an unclaimed domain shows a Claim button that assigns it to you.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: Domains screen — plain partner rows, unclaimed claim flow, strain dots"
```

---

### Task 8: Domain detail (CardDetailScreen rework)

**Files:**
- Create: `src/features/cards/components/StrainSelector.tsx`
- Modify: `src/features/cards/screens/CardDetailScreen.tsx`

- [ ] **Step 1: Create StrainSelector.tsx** (drop-in replacement for the removed frequency selector; same container style)

```tsx
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { DomainStrain } from '@shared/data/FakeDataStore';

interface StrainSelectorProps {
  value?: DomainStrain;
  onChange: (strain: DomainStrain) => void;
}

const OPTIONS: Array<{ value: DomainStrain; label: string; activeClass: string }> = [
  { value: 'light', label: 'Light', activeClass: 'bg-secondary-600' },
  { value: 'manageable', label: 'Manageable', activeClass: 'bg-primary-600' },
  { value: 'drowning', label: 'Drowning', activeClass: 'bg-error' },
];

// Self-reported strain: the one signal that crosses the partner wall.
export const StrainSelector: React.FC<StrainSelectorProps> = ({ value, onChange }) => (
  <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <Text className="text-sm font-semibold text-text-secondary mb-3">
      How heavy does this domain feel?
    </Text>
    <View className="flex-row gap-2">
      {OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            value === opt.value ? opt.activeClass : 'border border-border'
          }`}
          onPress={() => onChange(opt.value)}
        >
          <Text
            className={`text-[13px] font-semibold ${
              value === opt.value ? 'text-white' : 'text-text-secondary'
            }`}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
```

(If `bg-error` isn't a valid class in `tailwind.config.js`, use the error token class that the leave-household UI uses — grep `error` in `tailwind.config.js`.)

- [ ] **Step 2: Rework CardDetailScreen**

The screen already has an `isOwner` gate (it gated Notes/Archive/frequency). Apply:
- Rename local `isOwner` semantics: head = `card.owner === currentUser`.
- **Head view:** where the frequency selector used to be, render `<StrainSelector value={card.strain} onChange={(s) => updateCard(card.name, { strain: s, strainAt: new Date().toISOString() })} />`. Below the To-Do section, add a **Someday** section listing `selectSomedayForDomain(netItems, card.name)` (import from `@features/net/logic/netItemLogic`; get `netItems`, `triageNetItem` from `useDataStore`). Each someday row shows content + two actions reusing the Task 6 pattern: "Task" (opens the screen's existing AddTaskSheet with `initialNote={item.content}` and `initialCard={card.name}`, then `triageNetItem(item.id, 'accepted')` in `onTaskAdded`) and "Done" (`triageNetItem(item.id, 'done')`).
- **Non-head view (the wall):** if the card has an owner and it isn't you, render ONLY: the domain name header, the head's name, and an empty state — `"{card.owner} heads this — nothing for you to track here."` No task list, no note, no someday, no strain editing (show the strain label read-only — it's the cross-wall signal: `Feels {card.strain} to {card.owner}` when set).
- **Unclaimed view:** name + a Claim button (same `reassignCards([{ name, owner: currentUser }])` as Task 7).

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit && npm run lint
```
Simulator: open own domain → strain selector + someday pile; open partner's domain → wall copy + read-only strain; unclaimed → claim button.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: domain detail — strain selector, someday pile, non-head wall"
```

---

### Task 9: Tasks visibility + strain check banner

**Files:**
- Modify: `src/features/tasks/screens/TasksScreen.tsx`
- Create: `src/features/cards/components/StrainCheckBanner.tsx`
- Modify: `src/features/cards/screens/CardsScreen.tsx` (mount banner in `listHeader`)

- [ ] **Step 1: Enforce task visibility**

In `TasksScreen.tsx`, wherever tasks are read from the store, wrap with the tested selector:

```ts
import { selectVisibleTasks } from '@features/net/logic/netItemLogic';
// ...
const visibleTasks = useMemo(() => selectVisibleTasks(tasks, currentUser), [tasks, currentUser]);
```

and use `visibleTasks` everywhere the screen previously used `tasks`. If the screen already filters by owner, replace the inline filter with this selector so there is exactly one implementation of the wall.

- [ ] **Step 2: Create StrainCheckBanner.tsx**

```tsx
import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text, BottomSheet } from '@shared/components/ui';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { domainsNeedingStrainCheck } from '@features/net/logic/netItemLogic';
import { StrainSelector } from './StrainSelector';

// Weekly, dismissible prompt to self-rate your own domains. Never rates the partner's.
export const StrainCheckBanner: React.FC = () => {
  const { currentUser } = useCurrentUser();
  const { cards, updateCard } = useDataStore();
  const [dismissed, setDismissed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const stale = useMemo(
    () => domainsNeedingStrainCheck(cards, currentUser, new Date()),
    [cards, currentUser]
  );

  if (dismissed || stale.length === 0) return null;

  return (
    <>
      <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm flex-row items-center">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-semibold text-text">Weekly check-in</Text>
          <Text className="text-[13px] text-text-secondary mt-0.5">
            How heavy do your domains feel right now?
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary-600 px-3.5 py-2 rounded-lg mr-2"
          onPress={() => setSheetOpen(true)}
        >
          <Text className="text-white text-[13px] font-semibold">Rate</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDismissed(true)} className="p-1">
          <Text className="text-text-muted text-lg">✕</Text>
        </TouchableOpacity>
      </View>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <Text className="text-xl font-bold text-text mb-4">Your domains this week</Text>
        {stale.map((card) => (
          <View key={card.name} className="mb-2">
            <Text className="text-sm font-semibold text-text mb-1">{card.name}</Text>
            <StrainSelector
              value={card.strain}
              onChange={(s) =>
                updateCard(card.name, { strain: s, strainAt: new Date().toISOString() })
              }
            />
          </View>
        ))}
      </BottomSheet>
    </>
  );
};
```

- [ ] **Step 3: Mount in CardsScreen `listHeader`** (where BalanceMeter used to be)

```tsx
import { StrainCheckBanner } from '../components/StrainCheckBanner';
// in listHeader, after <NavigationRow …/>:
{filter === 'all' && <StrainCheckBanner />}
```

- [ ] **Step 4: Verify**

```bash
npx tsc --noEmit && npm run lint && npx jest
```
Simulator: banner appears when own domains are unrated; rating all domains hides it (stale list empties); partner tasks never appear on TasksScreen.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: task visibility wall and weekly strain check banner"
```

---

### Task 10: Final verification + two-account walkthrough

- [ ] **Step 1: Full gate**

```bash
npx tsc --noEmit && npm run lint && npx jest && npm run format
git diff --stat   # review formatter churn, then commit if any
```

- [ ] **Step 2: Manual two-account walkthrough** (use the dev auto-login pair; sign into the second account on a second simulator)

1. Account A captures "kids need new shoes" → appears in A's "To route", nowhere on B.
2. A routes it to a domain headed by B → item leaves A's list (shows faded in "Caught" ≤24h), appears in B's "Your triage". A sees nothing else about it.
3. B triages → Task: task appears on B's TasksScreen and in the domain; A's TasksScreen unchanged.
4. B declines a second item with a reason → it appears in A's "Returned to you" with the reason; A re-routes or lets it go.
5. B marks one "Someday" → visible in B's domain detail someday pile; invisible to A.
6. A opens B's domain → sees only name, head, read-only strain. No tasks.
7. Unclaimed domain shows Claim for both; claiming moves it under "yours" and persists after app reload (Supabase row updated).
8. Strain banner: rate a domain "drowning" → dot shows on A's Domains list; B sees the strain label on A's domain row/detail.
9. Reload both apps (DataInitializer path): all of the above state survives.

- [ ] **Step 3: Commit any fixes, then hand off**

Implementation complete → use superpowers:finishing-a-development-branch (merge/PR decision belongs to Savannah).

---

## Self-review notes (already applied)

- **Spec coverage:** capture/route/triage/decline (Tasks 4, 6), wall (Tasks 7–9), strain (Tasks 8–9), unclaimed domains (Tasks 3, 7, 8), BalanceMeter/frequency removal (Task 5), migration + legacy status mapping (Task 3), error handling for deleted domains (DB `on delete set null` + `canTransition` guards), testing section (Task 2 + walkthrough).
- **Spec deviation (intentional):** legacy `pending` messages map to `unrouted`, not `pending` — a domainless `pending` item would be invisible to every selector. Recorded in the plan header.
- **Deferred consciously (per spec):** offline capture queueing relies on existing Supabase client behavior; no RLS-level wall; contract screen skipped.
- **Type consistency:** `NetItem.domain` (name) everywhere client-side; `domain_id` only in SQL and supabase payloads. `strainAt` ISO string client-side, `strain_at timestamptz` in DB.
