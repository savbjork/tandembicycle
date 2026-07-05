# Card Frequency & Weight Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `frequency` field (`'daily' | 'weekly' | 'as-needed'`) to cards, use it to show weighted points in the Balance Meter, tint card list items by frequency, and let owners edit frequency on the Card Detail screen.

**Architecture:** Changes flow from data model outward: first update the type and Supabase schema, then wire persistence through the store and data initializer, then update the three UI components (BalanceMeter, CardListItem, CardDetailScreen). Each task is independently committable. No test framework exists in this project — verification is visual via `npm run ios`.

**Tech Stack:** React Native + Expo, TypeScript strict, NativeWind (Tailwind), Zustand, Supabase

---

### Task 1: Add `CardFrequency` type and update the `Card` interface

**Files:**
- Modify: `tandem-mobile/src/shared/data/FakeDataStore.ts:1-12`

**Background:** `Card` currently has no frequency field. We add a typed enum and a weight lookup map here so all other files can import them. `frequency` is non-optional — every card always has a value.

**Step 1: Add the type and weight map above the `Card` interface**

In `FakeDataStore.ts`, replace the existing `Card` interface block:

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

**Step 2: Check TypeScript compiles**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: errors in files that construct `Card` objects without `frequency` (dataStore, DataInitializer, useCardShuffle). That's expected — we fix them in subsequent tasks.

**Step 3: Commit**

```bash
git add tandem-mobile/src/shared/data/FakeDataStore.ts
git commit -m "feat: add CardFrequency type and FREQUENCY_WEIGHT to Card interface"
```

---

### Task 2: Add `frequency` column to Supabase schema

**Files:**
- Modify: `supabase/schema.sql:65-75` (the `cards` table definition)

**Background:** The `cards` table currently has no `frequency` column. We add it with a `NOT NULL DEFAULT 'as-needed'` so existing rows get a sensible value and the constraint is enforced going forward. You also need to run this migration in the Supabase dashboard.

**Step 1: Add the column to the `cards` table in schema.sql**

Find the `cards` table definition (around line 65). Add `frequency` after `note`:

```sql
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

**Step 2: Run the migration in Supabase dashboard**

Go to Supabase Dashboard → SQL Editor and run:

```sql
alter table cards
    add column if not exists frequency text not null default 'as-needed'
    check (frequency in ('daily', 'weekly', 'as-needed'));
```

This adds the column to your live database without data loss. Existing cards get `'as-needed'`.

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add frequency column to cards table"
```

---

### Task 3: Persist `frequency` in the data store

**Files:**
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`

**Background:** Three store actions write cards to Supabase: `addCard`, `updateCard`, and `resetToDefaults`. Each needs to include `frequency` in its payload. The `Card` type change from Task 1 will cause TypeScript errors here that this task resolves.

**Step 1: Update `addCard` to include frequency in the Supabase insert**

Find the `addCard` Supabase insert (around line 93). Add `frequency`:

```ts
supabase
    .from('cards')
    .insert({
        household_id: householdId,
        name: card.name,
        owner_id: ownerId,
        note: card.note ?? null,
        frequency: card.frequency,
    })
```

**Step 2: Update `updateCard` to persist frequency changes**

Find the `dbUpdates` block inside `updateCard` (around line 123). Add frequency mapping:

```ts
const dbUpdates: Record<string, unknown> = {};
if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
if (Object.keys(dbUpdates).length > 0) {
    supabase.from('cards').update(dbUpdates).eq('id', card.dbId);
}
```

**Step 3: Update `resetToDefaults` to include frequency in each card insert**

Find the insert inside the `for (const card of cards)` loop in `resetToDefaults` (around line 445):

```ts
const { data } = await supabase
    .from('cards')
    .insert({
        household_id: householdId,
        name: card.name,
        owner_id: ownerId,
        note: card.note ?? null,
        frequency: card.frequency,
    })
    .select('id')
    .single();
```

**Step 4: Check TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: errors should reduce. Remaining errors will be in DataInitializer and useCardShuffle (Tasks 4 and 5).

**Step 5: Commit**

```bash
git add tandem-mobile/src/store/slices/dataStore.ts
git commit -m "feat: persist card frequency in Supabase store actions"
```

---

### Task 4: Read `frequency` from Supabase in DataInitializer

**Files:**
- Modify: `tandem-mobile/src/app/providers/DataInitializer.tsx`

**Background:** `DataInitializer` fetches cards from Supabase and maps them to `Card` objects. It currently doesn't select or map the `frequency` column. We add it to both the active and archived card selects, then map it with a safe fallback.

**Step 1: Add `frequency` to the active cards select**

Find the active cards fetch (around line 45). Change the select string:

```ts
const { data: activeCardsData } = await supabase
    .from('cards')
    .select('id, name, note, owner_id, frequency')
    .eq('household_id', householdId)
    .eq('is_archived', false)
    .order('created_at');
```

**Step 2: Map `frequency` in the active cards mapping**

```ts
const activeCards: Card[] = (activeCardsData ?? []).map((c) => ({
    dbId: c.id as string,
    name: c.name as string,
    owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
    frequency: (c.frequency as CardFrequency | null) ?? 'as-needed',
    note: (c.note as string | null) ?? undefined,
}));
```

**Step 3: Add `frequency` to the archived cards select**

```ts
const { data: archivedCardsData } = await supabase
    .from('cards')
    .select('id, name, note, owner_id, archived_at, frequency')
    .eq('household_id', householdId)
    .eq('is_archived', true)
    .order('created_at');
```

**Step 4: Map `frequency` in the archived cards mapping**

```ts
const archivedCards: Card[] = (archivedCardsData ?? []).map((c) => ({
    dbId: c.id as string,
    name: c.name as string,
    owner: nameByUserId[c.owner_id as string] ?? 'Unknown',
    frequency: (c.frequency as CardFrequency | null) ?? 'as-needed',
    note: (c.note as string | null) ?? undefined,
    archived: true,
    archivedAt: (c.archived_at as string | null) ?? undefined,
}));
```

**Step 5: Add the import for `CardFrequency`**

At the top of `DataInitializer.tsx`, update the import:

```ts
import type { Card, Task, DropZoneItem, CardFrequency } from '@shared/data/FakeDataStore';
```

**Step 6: Check TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: DataInitializer errors resolved. Remaining errors in `useCardShuffle.ts` and `AddCardModal.tsx`.

**Step 7: Commit**

```bash
git add tandem-mobile/src/app/providers/DataInitializer.tsx
git commit -m "feat: read and map card frequency from Supabase in DataInitializer"
```

---

### Task 5: Add frequency to default cards in `useCardShuffle`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Background:** `DEFAULT_CARDS` is currently an array of strings. The `startWithDefaults` function constructs `Card` objects from it. Since `frequency` is now required, we need a frequency assignment for each default card. We replace the string array with a typed array of `{ name, frequency }` objects.

**Step 1: Replace `DEFAULT_CARDS` with a typed array including frequency**

Replace the `DEFAULT_CARDS` constant (lines 6-70) with:

```ts
export const DEFAULT_CARDS: Array<{ name: string; frequency: CardFrequency }> = [
    // --- Daily Cleaning & Chores ---
    { name: 'Cook dinner',                              frequency: 'daily' },
    { name: 'Cook breakfast/lunch',                     frequency: 'daily' },
    { name: 'Dishes',                                   frequency: 'daily' },
    { name: 'Wipe down counters',                       frequency: 'daily' },
    { name: 'Take out trash',                           frequency: 'weekly' },
    { name: 'Recycling & compost',                      frequency: 'weekly' },
    { name: 'Mop',                                      frequency: 'weekly' },
    { name: 'Sweep',                                    frequency: 'weekly' },
    { name: 'Vacuum',                                   frequency: 'weekly' },
    { name: 'Laundry',                                  frequency: 'weekly' },
    { name: 'Wash bedding & linens',                    frequency: 'weekly' },
    { name: 'Water plants',                             frequency: 'weekly' },
    { name: 'Sort mail & packages',                     frequency: 'weekly' },

    // --- Deep Cleaning & Organization ---
    { name: 'Bathroom deep clean',                      frequency: 'as-needed' },
    { name: 'Kitchen deep clean',                       frequency: 'as-needed' },
    { name: 'Clean out fridge',                         frequency: 'as-needed' },
    { name: 'Clean microwave/oven',                     frequency: 'as-needed' },
    { name: 'Clean windows & mirrors',                  frequency: 'as-needed' },
    { name: 'Dusting',                                  frequency: 'weekly' },
    { name: 'Organize closets & drawers',               frequency: 'as-needed' },
    { name: 'Decluttering/Donations',                   frequency: 'as-needed' },

    // --- Food & Supplies ---
    { name: 'Meal planning',                            frequency: 'weekly' },
    { name: 'Grocery shopping',                         frequency: 'weekly' },
    { name: 'Buy cleaning supplies',                    frequency: 'as-needed' },
    { name: 'Buy household consumables (TP, soap)',     frequency: 'as-needed' },

    // --- Maintenance & Household ---
    { name: 'House maintenance',                        frequency: 'as-needed' },
    { name: 'Yard work / Lawn care',                    frequency: 'weekly' },
    { name: 'Snow removal / Seasonal exterior',         frequency: 'as-needed' },
    { name: 'Car maintenance',                          frequency: 'as-needed' },
    { name: 'Vehicle registration',                     frequency: 'as-needed' },
    { name: 'Home tech support & wifi',                 frequency: 'as-needed' },

    // --- Financial & Admin ---
    { name: 'Manage budget',                            frequency: 'weekly' },
    { name: 'Pay credit card bills',                    frequency: 'weekly' },
    { name: 'Pay utility bills',                        frequency: 'monthly' as unknown as CardFrequency, },
    { name: 'Manage subscriptions',                     frequency: 'as-needed' },
    { name: 'Taxes',                                    frequency: 'as-needed' },
    { name: 'Retirement',                               frequency: 'as-needed' },
    { name: 'Investing',                                frequency: 'as-needed' },
    { name: 'Car insurance',                            frequency: 'as-needed' },
    { name: 'Rental/Homeowners Insurance',              frequency: 'as-needed' },
    { name: 'Health insurance admin',                   frequency: 'as-needed' },
    { name: 'Internet',                                 frequency: 'as-needed' },

    // --- Relational & Social ---
    { name: 'Plan dates',                               frequency: 'as-needed' },
    { name: 'Plan vacations & travel',                  frequency: 'as-needed' },
    { name: 'Family events',                            frequency: 'as-needed' },
    { name: 'Family holiday/birthday gifts',            frequency: 'as-needed' },
    { name: 'Write thank you notes/cards',              frequency: 'as-needed' },
    { name: 'Host guests/entertaining',                 frequency: 'as-needed' },

    // --- Health & Personal Admin ---
    { name: 'Schedule medical/dental appointments',     frequency: 'as-needed' },
    { name: 'Pick up prescriptions',                    frequency: 'as-needed' },
];
```

Note: "Pay utility bills" maps to 'as-needed' since monthly doesn't exist — correct the `frequency: 'as-needed'` directly (no cast needed):

```ts
{ name: 'Pay utility bills', frequency: 'as-needed' },
```

**Step 2: Add `CardFrequency` to the import**

Update the import at the top of `useCardShuffle.ts`:

```ts
import { type Card, type Task, type Person, type CardFrequency } from '@shared/data/FakeDataStore';
```

**Step 3: Update `startWithDefaults` to include frequency**

Find `startWithDefaults` (around line 104). Update it to spread frequency from the default card object:

```ts
const startWithDefaults = useCallback(() => {
    setArchivedCardNames([]);
    const defaultCardObjects = DEFAULT_CARDS.map(({ name, frequency }) => ({
        name,
        frequency,
        owner: currentUser,
    }));
    setIsDefaultsMode(true);
    setShuffledCards(defaultCardObjects);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
}, [currentUser]);
```

**Step 4: Update the `shuffledCards` state type to include frequency**

The `shuffledCards` state is typed as `Array<{ name: string, owner: Person }>`. Update to include frequency:

```ts
const [shuffledCards, setShuffledCards] = useState<Array<{ name: string; owner: Person; frequency: CardFrequency }>>([]);
```

**Step 5: Update `finishShuffle` to pass frequency to `resetToDefaults`**

In `finishShuffle`, update the `freshCards` map:

```ts
const freshCards: Card[] = nonArchivedCards.map(c => ({
    name: c.name,
    owner: c.owner,
    frequency: c.frequency,
}));
```

**Step 6: Update `startSwipeShuffle` to preserve frequency from existing cards**

`startSwipeShuffle` spreads existing cards into `shuffledCards`. Update:

```ts
const startSwipeShuffle = useCallback((cardsToShuffle: Card[] = cards) => {
    setArchivedCardNames([]);
    setIsDefaultsMode(false);
    setShowShuffleModal(false);
    setShuffledCards(cardsToShuffle.map(c => ({ name: c.name, owner: c.owner, frequency: c.frequency })));
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
}, [cards]);
```

**Step 7: Check TypeScript**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: errors should reduce further. Remaining errors likely in `AddCardModal`.

**Step 8: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: add frequency to DEFAULT_CARDS and wire through card shuffle"
```

---

### Task 6: Pass `frequency` in `AddCardModal`

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/AddCardModal.tsx`

**Background:** `AddCardModal` calls `addCard({ name, owner, note })`. Now that `frequency` is required on `Card`, it must be included. User-created cards default to `'as-needed'` — we don't need a picker in the modal (they can change it on the detail screen).

**Step 1: Update the `handleAddCard` call**

Find `handleAddCard` (around line 20). Add `frequency`:

```ts
const handleAddCard = () => {
    if (!cardName.trim()) return;
    addCard({
        name: cardName.trim(),
        owner: selectedOwner,
        note: cardNote.trim() || undefined,
        frequency: 'as-needed',
    });
    onClose();
};
```

**Step 2: Check TypeScript — should now be clean**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/AddCardModal.tsx
git commit -m "feat: default new cards to as-needed frequency"
```

---

### Task 7: Update `BalanceMeter` to show weighted points

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/BalanceMeter.tsx`

**Background:** Currently counts cards per person. Replace with weighted sum using `FREQUENCY_WEIGHT`. The bar fills proportionally to weighted totals, the large numbers show points, the subtitle says "X pts total".

**Step 1: Update the component**

Replace the full file content:

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
    const activeCarts = cards.filter((c: Card) => !c.archived);
    const currentUserPoints = activeCarts
        .filter((c: Card) => c.owner === currentUser)
        .reduce((sum, c) => sum + FREQUENCY_WEIGHT[c.frequency], 0);
    const partnerPoints = activeCarts
        .filter((c: Card) => c.owner === partner)
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
                <View
                    className="h-full bg-primary-600"
                    style={{ width: totalPoints > 0 ? `${(currentUserPoints / totalPoints) * 100}%` : '50%' }}
                />
                <View
                    className="h-full bg-secondary-600"
                    style={{ width: totalPoints > 0 ? `${(partnerPoints / totalPoints) * 100}%` : '50%' }}
                />
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

**Step 2: Verify visually**

Run `npm run ios` in `tandem-mobile/`. On the Cards screen (filter = "all"), the BalanceMeter should show weighted point totals, not card counts. Two people with equal daily cards but unequal as-needed cards should show meaningful imbalance.

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/BalanceMeter.tsx
git commit -m "feat: balance meter shows weighted points by card frequency"
```

---

### Task 8: Add frequency background tint to `CardListItem`

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/CardListItem.tsx`

**Background:** Cards currently have a uniform `bg-surface` background. We tint by frequency: daily=primary-50, weekly=secondary-50, as-needed=surface. The border shifts to match. Selection state (`isSelected`) border still overrides.

**Step 1: Add a frequency→style helper and apply it**

Replace the full file content:

```tsx
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, OwnerBadge } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
import { type Card, type Task, type CardFrequency } from '@shared/data/FakeDataStore';

interface CardListItemProps {
    card: Card;
    tasks: Task[];
    isSelecting: boolean;
    isSelected: boolean;
    onPress: () => void;
    onToggleSelection: () => void;
    showOwnerBadge: boolean;
    showTasks: boolean;
    onToggleTaskDone: (taskId: string, isDone: boolean) => void;
}

const FREQUENCY_STYLE: Record<CardFrequency, { bg: string; border: string }> = {
    daily: { bg: 'bg-primary-50', border: 'border-primary-200' },
    weekly: { bg: 'bg-secondary-50', border: 'border-secondary-200' },
    'as-needed': { bg: 'bg-surface', border: 'border-border-light' },
};

export const CardListItem: React.FC<CardListItemProps> = ({
    card,
    tasks,
    isSelecting,
    isSelected,
    onPress,
    onToggleSelection,
    showOwnerBadge,
    showTasks,
    onToggleTaskDone,
}) => {
    const { bg, border } = FREQUENCY_STYLE[card.frequency];
    const borderClass = isSelecting && isSelected ? 'border-primary-600' : border;

    return (
        <TouchableOpacity
            className={`${bg} p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${borderClass}`}
            onPress={isSelecting ? onToggleSelection : onPress}
        >
            <View className="flex-row justify-between items-center">
                <View className="flex-1 flex-row items-center gap-3">
                    {isSelecting && (
                        <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={20}
                            color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
                        />
                    )}
                    <Text className="text-[17px] font-bold text-text">
                        {card.name}
                    </Text>
                </View>
                {!isSelecting && showOwnerBadge && (
                    <OwnerBadge name={card.owner} />
                )}
            </View>

            {!isSelecting && showTasks && tasks.length > 0 && (
                <View className="pl-0 mt-2">
                    {tasks.slice(0, 3).map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onToggleDone={onToggleTaskDone}
                            variant="list"
                            hideBackground
                            hideCardName
                            showOwnerIcon={false}
                        />
                    ))}
                    {tasks.length > 3 && (
                        <Text className="text-[11px] text-text-muted italic ml-14">
                            + {tasks.length - 3} more tasks
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};
```

**Step 2: Verify visually**

Run the app. Daily cards should have a warm red-tinted background, weekly cards a purple tint, as-needed cards neutral. Tapping to select should still show the blue border override.

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/CardListItem.tsx
git commit -m "feat: tint card list items by frequency"
```

---

### Task 9: Add frequency selector to `CardDetailScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Background:** The frequency selector sits in its own card block between the "Not Owner" banner and the "To Do" section. It uses `ChipGroup` (already available in `@shared/components/ui`) with three options. Tapping saves immediately via `updateCard`. Only the card owner sees the editable version; non-owners see a read-only label. Style matches the Notes block.

**Step 1: Add frequency chip options constant and import**

Add the `CardFrequency` import at the top of `CardDetailScreen.tsx`:

```ts
import type { Task, CardFrequency } from '@shared/data/FakeDataStore';
```

Add `ChipGroup` and `ChipOption` to the shared UI import:

```ts
import { Text, ScreenHeader, FieldLabel, Badge, EmptyState, TextInput, ChipGroup } from '@shared/components/ui';
import type { ChipOption } from '@shared/components/ui/ChipGroup';
```

**Step 2: Add frequency state inside the component**

After the existing `useState` declarations (around line 35), add:

```ts
const [editFrequency, setEditFrequency] = useState<CardFrequency>(card.frequency);
```

**Step 3: Add frequency chip options**

After the `editFrequency` state, add:

```ts
const frequencyOptions: ChipOption<CardFrequency>[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'as-needed', label: 'As needed' },
];

const handleFrequencyChange = (freq: CardFrequency) => {
    setEditFrequency(freq);
    updateCard(card.name, { frequency: freq });
};
```

**Step 4: Add the frequency block to the JSX**

Insert a new block between the "Not Owner" banner (`</View>` on line ~119) and the "Pending Tasks" section (`<View className="mb-4">` on line ~122):

```tsx
{/* Frequency */}
<View className="bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm">
    <FieldLabel>Frequency</FieldLabel>
    {isOwner ? (
        <ChipGroup
            options={frequencyOptions}
            value={editFrequency}
            onChange={handleFrequencyChange}
        />
    ) : (
        <Text className="text-base text-text py-1 capitalize">
            {card.frequency === 'as-needed' ? 'As needed' : card.frequency.charAt(0).toUpperCase() + card.frequency.slice(1)}
        </Text>
    )}
</View>
```

**Step 5: Verify visually**

Run the app. Open any card detail. The frequency block should appear below the "Not Owner" banner (or below the title if you're the owner). Tapping a different chip should update immediately. Navigate back to the cards list — the card's tint should reflect the new frequency. Non-owner cards should show the frequency as a plain text label.

**Step 6: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "feat: add frequency selector to card detail screen"
```

---

## Summary

| Task | Files | What it does |
|------|-------|-------------|
| 1 | `FakeDataStore.ts` | Adds `CardFrequency` type, `FREQUENCY_WEIGHT`, updates `Card` |
| 2 | `supabase/schema.sql` + Supabase dashboard | Adds `frequency` column |
| 3 | `dataStore.ts` | Persists frequency in addCard, updateCard, resetToDefaults |
| 4 | `DataInitializer.tsx` | Reads frequency when loading cards from Supabase |
| 5 | `useCardShuffle.ts` | Adds frequency to DEFAULT_CARDS, threads through shuffle |
| 6 | `AddCardModal.tsx` | Defaults new cards to 'as-needed' |
| 7 | `BalanceMeter.tsx` | Shows weighted points instead of card count |
| 8 | `CardListItem.tsx` | Background tint by frequency |
| 9 | `CardDetailScreen.tsx` | Frequency selector for owners |
