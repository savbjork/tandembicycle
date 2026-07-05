# Card Frequency & Weight Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `frequency` field (`daily` | `weekly` | `as-needed`) to cards that drives a weighted Balance Meter and visual tints on card list items, with a segmented control editor on Card Detail.

**Architecture:** Frequency lives on the `Card` type and is stored in Supabase. `FREQUENCY_WEIGHT` maps each value to a numeric weight (3/2/1). All existing store actions (`addCard`, `updateCard`, `resetToDefaults`) persist frequency; `DataInitializer` fetches it on load.

**Tech Stack:** TypeScript, Zustand, Supabase, React Native, NativeWind (Tailwind)

---

## Reference: Design Doc

Full spec at `docs/plans/2026-03-11-card-frequency-weight-design.md`.

---

## Task 1: Add `CardFrequency` type and update `Card` interface

**Files:**
- Modify: `tandem-mobile/src/shared/data/FakeDataStore.ts:1-12`

**Step 1: Add type and constant**

Replace the top of `FakeDataStore.ts` (lines 1-12) with:

```ts
// ─── Domain Types ────────────────────────────────────────────

export type Person = string;

export type CardFrequency = 'daily' | 'weekly' | 'as-needed';

export const FREQUENCY_WEIGHT: Record<CardFrequency, number> = {
    daily: 3,
    weekly: 2,
    'as-needed': 1,
};

export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    frequency: CardFrequency;
    note?: string;
    archived?: boolean;
    archivedAt?: string;
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors pointing to places that construct `Card` objects without `frequency` (that's fine — we'll fix them in subsequent tasks).

**Step 3: Commit**

```bash
git add tandem-mobile/src/shared/data/FakeDataStore.ts
git commit -m "feat: add CardFrequency type and FREQUENCY_WEIGHT to Card interface"
```

---

## Task 2: Add `frequency` column to Supabase schema

**Files:**
- Modify: `supabase/schema.sql:65-75` (the `cards` table definition)

**Step 1: Update schema.sql**

In the `cards` table definition, add `frequency` after `note`:

```sql
-- cards: a responsibility area owned by one household member.
create table cards (
    id            text        primary key default 'card-' || gen_random_uuid()::text,
    internal_id   bigint      generated always as identity unique,
    household_id  text        not null references households(id) on delete cascade,
    name          text        not null,
    owner_id      uuid        not null references profiles(user_id) on delete restrict,
    note          text,
    frequency     text        not null default 'as-needed'
                              check (frequency in ('daily', 'weekly', 'as-needed')),
    is_archived   boolean     not null default false,
    archived_at   timestamptz,
    created_at    timestamptz not null default now()
);
```

**Step 2: Run migration in Supabase dashboard**

Open the Supabase dashboard → SQL Editor and run:

```sql
ALTER TABLE cards
    ADD COLUMN IF NOT EXISTS frequency text NOT NULL DEFAULT 'as-needed'
    CHECK (frequency IN ('daily', 'weekly', 'as-needed'));
```

Verify: go to Table Editor → cards → check that the `frequency` column exists with default `'as-needed'`.

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add frequency column to cards table schema"
```

---

## Task 3: Fetch `frequency` in DataInitializer

**Files:**
- Modify: `tandem-mobile/src/app/providers/DataInitializer.tsx:45-76`

**Step 1: Update active cards fetch to include `frequency`**

Change line 47 (the `.select(...)` for active cards):
```ts
.select('id, name, note, owner_id, frequency')
```

Change line 52-57 (the `.map(...)` for activeCards):
```ts
const activeCards: Card[] = (activeCardsData ?? []).map((c) => ({
    dbId: c.id as string,
    name: c.name as string,
    owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
    frequency: (c.frequency as CardFrequency) ?? 'as-needed',
    note: (c.note as string | null) ?? undefined,
}));
```

**Step 2: Update archived cards fetch to include `frequency`**

Change line 62 (the `.select(...)` for archived cards):
```ts
.select('id, name, note, owner_id, archived_at, frequency')
```

Change line 67-74 (the `.map(...)` for archivedCards):
```ts
const archivedCards: Card[] = (archivedCardsData ?? []).map((c) => ({
    dbId: c.id as string,
    name: c.name as string,
    owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
    frequency: (c.frequency as CardFrequency) ?? 'as-needed',
    note: (c.note as string | null) ?? undefined,
    archived: true,
    archivedAt: (c.archived_at as string | null) ?? undefined,
}));
```

**Step 3: Add `CardFrequency` to the import**

Change the import on line 4:
```ts
import type { Card, Task, DropZoneItem, CardFrequency } from '@shared/data/FakeDataStore';
```

**Step 4: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors reduced (DataInitializer now passes `frequency`).

**Step 5: Commit**

```bash
git add tandem-mobile/src/app/providers/DataInitializer.tsx
git commit -m "feat: fetch and map frequency from Supabase in DataInitializer"
```

---

## Task 4: Persist `frequency` in dataStore actions

**Files:**
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`

**Step 1: Update `addCard` Supabase insert (line 95)**

Add `frequency` to the insert payload:
```ts
.insert({
    household_id: householdId,
    name: card.name,
    owner_id: ownerId,
    frequency: card.frequency,
    note: card.note ?? null,
})
```

**Step 2: Update `updateCard` Supabase persistence (lines 122-126)**

Add frequency mapping inside the `dbUpdates` block, after the note line:
```ts
if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
```

**Step 3: Update `resetToDefaults` Supabase insert (lines 447-452)**

Add `frequency` to the card insert payload:
```ts
.insert({
    household_id: householdId,
    name: card.name,
    owner_id: ownerId,
    frequency: card.frequency,
    note: card.note ?? null,
})
```

**Step 4: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

Expected: errors now only come from places that build `Card` objects without `frequency` (useCardShuffle, CardDetailScreen's AddCard flow).

**Step 5: Commit**

```bash
git add tandem-mobile/src/store/slices/dataStore.ts
git commit -m "feat: persist frequency in addCard, updateCard, resetToDefaults"
```

---

## Task 5: Assign frequencies to default cards in useCardShuffle

The default cards list (`DEFAULT_CARDS`) is a flat string array. When "Fresh Start" is used, `finishShuffle` builds `Card` objects from it. We need to add a frequency map for each default card.

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Add a `DEFAULT_CARD_FREQUENCIES` map after `DEFAULT_CARDS`**

Add this after line 70 (end of `DEFAULT_CARDS`):

```ts
export const DEFAULT_CARD_FREQUENCIES: Record<string, CardFrequency> = {
    // Daily
    'Cook dinner': 'daily',
    'Cook breakfast/lunch': 'daily',
    'Dishes': 'daily',
    'Wipe down counters': 'daily',
    'Water plants': 'daily',
    'Sort mail & packages': 'daily',

    // Weekly
    'Take out trash': 'weekly',
    'Recycling & compost': 'weekly',
    'Mop': 'weekly',
    'Sweep': 'weekly',
    'Vacuum': 'weekly',
    'Laundry': 'weekly',
    'Wash bedding & linens': 'weekly',
    'Meal planning': 'weekly',
    'Grocery shopping': 'weekly',
    'Buy cleaning supplies': 'weekly',
    'Buy household consumables (TP, soap)': 'weekly',
    'Yard work / Lawn care': 'weekly',
    'Pay credit card bills': 'weekly',
    'Pay utility bills': 'weekly',

    // As-needed (everything else defaults here, but explicit for clarity)
    'Bathroom deep clean': 'as-needed',
    'Kitchen deep clean': 'as-needed',
    'Clean out fridge': 'as-needed',
    'Clean microwave/oven': 'as-needed',
    'Clean windows & mirrors': 'as-needed',
    'Dusting': 'as-needed',
    'Organize closets & drawers': 'as-needed',
    'Decluttering/Donations': 'as-needed',
    'House maintenance': 'as-needed',
    'Snow removal / Seasonal exterior': 'as-needed',
    'Car maintenance': 'as-needed',
    'Vehicle registration': 'as-needed',
    'Home tech support & wifi': 'as-needed',
    'Manage budget': 'as-needed',
    'Manage subscriptions': 'as-needed',
    'Taxes': 'as-needed',
    'Retirement': 'as-needed',
    'Investing': 'as-needed',
    'Car insurance': 'as-needed',
    'Rental/Homeowners Insurance': 'as-needed',
    'Health insurance admin': 'as-needed',
    'Internet': 'as-needed',
    'Plan dates': 'as-needed',
    'Plan vacations & travel': 'as-needed',
    'Family events': 'as-needed',
    'Family holiday/birthday gifts': 'as-needed',
    'Write thank you notes/cards': 'as-needed',
    'Host guests/entertaining': 'as-needed',
    'Schedule medical/dental appointments': 'as-needed',
    'Pick up prescriptions': 'as-needed',
};
```

**Step 2: Add `CardFrequency` to the import**

Change the import on line 3:
```ts
import { type Card, type Task, type Person, type CardFrequency } from '@shared/data/FakeDataStore';
```

**Step 3: Update `finishShuffle` to include frequency on default cards (line 136)**

Change line 136:
```ts
const freshCards: Card[] = nonArchivedCards.map(c => ({
    name: c.name,
    owner: c.owner,
    frequency: DEFAULT_CARD_FREQUENCIES[c.name] ?? 'as-needed',
}));
```

**Step 4: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

Expected: the `resetToDefaults` path now passes valid `Card` objects with `frequency`.

**Step 5: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: assign default frequencies to fresh start cards"
```

---

## Task 6: Update BalanceMeter to use weighted points

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/BalanceMeter.tsx`

**Step 1: Rewrite the component**

Replace the entire file content with:

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/components/ui';
import { type Card, FREQUENCY_WEIGHT } from '@shared/data/FakeDataStore';

interface BalanceMeterProps {
    cards: Card[];
    currentUser: string;
    partner: string;
}

export const BalanceMeter: React.FC<BalanceMeterProps> = ({ cards, currentUser, partner }) => {
    const activeCards = cards.filter((c) => !c.archived);

    const currentUserPoints = activeCards
        .filter((c) => c.owner === currentUser)
        .reduce((sum, c) => sum + FREQUENCY_WEIGHT[c.frequency], 0);

    const partnerPoints = activeCards
        .filter((c) => c.owner === partner)
        .reduce((sum, c) => sum + FREQUENCY_WEIGHT[c.frequency], 0);

    const totalPoints = currentUserPoints + partnerPoints;

    return (
        <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-base font-semibold text-text">
                        Balance
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-0.5">
                        {totalPoints} pts total
                    </Text>
                </View>
            </View>

            <View className="h-2 bg-border-muted rounded-full flex-row overflow-hidden mb-4">
                {totalPoints > 0 && (
                    <>
                        <View
                            className="h-full bg-primary-600"
                            style={{ width: `${(currentUserPoints / totalPoints) * 100}%` }}
                        />
                        <View
                            className="h-full bg-secondary-600"
                            style={{ width: `${(partnerPoints / totalPoints) * 100}%` }}
                        />
                    </>
                )}
            </View>

            <View className="flex-row justify-around">
                <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600">
                        {currentUserPoints}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {currentUser}
                    </Text>
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-bold text-secondary-600">
                        {partnerPoints}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {partner}
                    </Text>
                </View>
            </View>
        </View>
    );
};
```

**Step 2: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/BalanceMeter.tsx
git commit -m "feat: switch BalanceMeter from card count to weighted frequency points"
```

---

## Task 7: Add frequency tint to CardListItem

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/CardListItem.tsx`

**Step 1: Add a frequency-to-class helper inside the component file**

After the imports, before the component, add:

```ts
const FREQUENCY_STYLE: Record<string, { bg: string; border: string }> = {
    daily: { bg: 'bg-primary-50', border: 'border-primary-200' },
    weekly: { bg: 'bg-secondary-50', border: 'border-secondary-200' },
    'as-needed': { bg: 'bg-surface', border: 'border-border-light' },
};
```

**Step 2: Use it in the `TouchableOpacity` className**

Replace the current `className` on the `TouchableOpacity` (line 34):

```tsx
<TouchableOpacity
    className={`${FREQUENCY_STYLE[card.frequency]?.bg ?? 'bg-surface'} p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
        isSelecting && isSelected
            ? 'border-primary-600'
            : (FREQUENCY_STYLE[card.frequency]?.border ?? 'border-border-light')
    }`}
    onPress={isSelecting ? onToggleSelection : onPress}
>
```

**Step 3: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

**Step 4: Commit**

```bash
git add tandem-mobile/src/features/cards/components/CardListItem.tsx
git commit -m "feat: tint CardListItem background and border by card frequency"
```

---

## Task 8: Add frequency segmented control to CardDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Step 1: Add `CardFrequency` import**

Change the import on line 11:
```ts
import type { Task, CardFrequency } from '@shared/data/FakeDataStore';
```

**Step 2: Add the `FrequencySelector` component**

Add this component definition before the `CardDetailScreen` export (after the imports):

```tsx
const FREQUENCY_OPTIONS: { label: string; value: CardFrequency }[] = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'As needed', value: 'as-needed' },
];

const FREQUENCY_ACTIVE_STYLE: Record<CardFrequency, string> = {
    daily: 'bg-primary-600',
    weekly: 'bg-secondary-600',
    'as-needed': 'bg-gray-500',  // 'neutral' not in custom palette; gray-500 is standard Tailwind (matches existing use of bg-yellow-50 etc. in this codebase)
};

interface FrequencySelectorProps {
    value: CardFrequency;
    onChange: (v: CardFrequency) => void;
}

const FrequencySelector: React.FC<FrequencySelectorProps> = ({ value, onChange }) => (
    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
        <FieldLabel>Frequency</FieldLabel>
        <View className="flex-row rounded-lg overflow-hidden border border-border-light mt-1">
            {FREQUENCY_OPTIONS.map((opt, i) => (
                <TouchableOpacity
                    key={opt.value}
                    onPress={() => onChange(opt.value)}
                    className={`flex-1 py-2 items-center ${
                        value === opt.value
                            ? FREQUENCY_ACTIVE_STYLE[opt.value]
                            : 'bg-surface'
                    } ${i > 0 ? 'border-l border-border-light' : ''}`}
                >
                    <Text
                        className={`text-sm font-semibold ${
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

**Step 3: Insert `FrequencySelector` (owner) and read-only label (non-owner) into the JSX**

In the `CardDetailScreen` return, between the "Not Owner Banner" block and the "Pending Tasks" block (after the closing `)}` of the banner, before `{/* Pending Tasks */}`), insert:

```tsx
{/* Frequency */}
{isOwner ? (
    <FrequencySelector
        value={card.frequency}
        onChange={(v) => updateCard(card.name, { frequency: v })}
    />
) : (
    <View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
        <FieldLabel>Frequency</FieldLabel>
        <Text className="text-base text-text py-1">
            {card.frequency === 'as-needed' ? 'As needed' : card.frequency.charAt(0).toUpperCase() + card.frequency.slice(1)}
        </Text>
    </View>
)}
```

**Step 4: Verify TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | head -40
```

Expected: clean (or errors only unrelated to this change).

**Step 5: Run the app and manually verify**

```bash
cd tandem-mobile && npm run ios
```

Check:
- Cards screen: each card has correct background tint (daily = red-tinted, weekly = purple-tinted, as-needed = plain white)
- Balance Meter: shows "X pts total" instead of "X cards total", numbers reflect weighted points
- Card Detail (as owner): segmented control shows between the lock banner (or top) and To Do section; tapping a segment immediately updates the card
- Card Detail (as non-owner): read-only frequency label is shown instead of segmented control

**Step 6: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "feat: add frequency segmented control to CardDetailScreen"
```

---

## Task 9: Fix remaining TypeScript errors for Card construction

Any remaining place that constructs a `Card` object without `frequency` will be a TS error. Find and fix them.

**Step 1: Find all remaining TS errors**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1
```

**Step 2: For each error, add `frequency: 'as-needed'` as the default**

Common locations:
- Any place that spreads or creates `Card` objects ad-hoc (e.g., tests, other hooks)

**Step 3: Verify clean compile**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: no output (clean).

**Step 4: Commit**

```bash
git add -p   # stage only frequency-related fixes
git commit -m "fix: add frequency field to all Card construction sites"
```

---

## Done

All tasks complete. The feature is fully implemented:
- `CardFrequency` type + `FREQUENCY_WEIGHT` in `FakeDataStore`
- `frequency` column in Supabase + schema file updated
- `DataInitializer` fetches frequency on load
- `addCard`, `updateCard`, `resetToDefaults` persist frequency
- Default cards get pre-assigned frequencies on Fresh Start
- `BalanceMeter` shows weighted points
- `CardListItem` tinted by frequency
- `CardDetailScreen` has segmented control (owner) / read-only label (non-owner)
