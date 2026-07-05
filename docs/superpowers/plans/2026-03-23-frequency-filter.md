# Frequency Filter Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single-select frequency filter (`all` / `daily` / `weekly` / `as-needed`) to the Cards screen filter sheet.

**Architecture:** Thread a new `frequencyFilter` preference through the existing filter pipeline — persisted in `useCardsFilterPreferences`, applied in `useCardsFiltering`, exposed in `CardFilterSheet`, and wired up in `CardsScreen`.

**Tech Stack:** React Native, TypeScript, NativeWind, Zustand, AsyncStorage

---

## Chunk 1: Data & filtering logic

### Task 1: Add `frequencyFilter` to preferences

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFilterPreferences.ts`

- [ ] Open `useCardsFilterPreferences.ts` and read it fully.

- [ ] Add `frequencyFilter` to `FilterPreferences` and its default:

```ts
import { type CardFrequency } from '@shared/data/FakeDataStore';

interface FilterPreferences {
  filter: CardsFilter;
  taskTimeFilter: TaskTimeFilter;
  hideCompleted: boolean;
  hideUndated: boolean;
  hideEmptyCards: boolean;
  frequencyFilter: CardFrequency | 'all';   // ← add this
}

const DEFAULTS: FilterPreferences = {
  filter: 'all',
  taskTimeFilter: 'thisWeek',
  hideCompleted: false,
  hideUndated: false,
  hideEmptyCards: false,
  frequencyFilter: 'all',                   // ← add this
};
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFilterPreferences.ts
git commit -m "feat: add frequencyFilter to cards filter preferences"
```

---

### Task 2: Apply frequency filter in `useCardsFiltering`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts`

- [ ] Open `useCardsFiltering.ts` and read it fully.

- [ ] Add `frequencyFilter` to the props interface:

```ts
import { type Card, type Task, type CardFrequency } from '@shared/data/FakeDataStore';

interface UseCardsFilteringProps {
  cards: Card[];
  tasks: Task[];
  filter: CardsFilter;
  taskTimeFilter: TaskTimeFilter;
  hideEmptyCards: boolean;
  hideCompleted: boolean;
  hideUndated: boolean;
  currentUser: string;
  searchQuery: string;
  frequencyFilter: CardFrequency | 'all';   // ← add this
}
```

- [ ] Destructure and apply it in the filter logic (after the ownership check):

```ts
export const useCardsFiltering = ({
  // ...existing params,
  frequencyFilter,
}: UseCardsFilteringProps) => {
  const filteredCards = useMemo(() => {
    const filtered = cards.filter((c: Card) => {
      if (c.archived) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      const matchesOwnership = filter === 'all' ? true : c.owner === currentUser;
      if (!matchesOwnership) return false;
      if (frequencyFilter !== 'all' && c.frequency !== frequencyFilter) return false; // ← add this

      if (hideEmptyCards) {
        // ...existing logic unchanged
      }
      return true;
    });
    // ...rest unchanged
  }, [
    cards, tasks, filter, taskTimeFilter, hideEmptyCards,
    hideCompleted, hideUndated, currentUser, searchQuery,
    frequencyFilter,  // ← add to deps
  ]);
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts
git commit -m "feat: filter cards by frequency in useCardsFiltering"
```

---

## Chunk 2: UI

### Task 3: Add Frequency section to `CardFilterSheet`

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/CardFilterSheet.tsx`

- [ ] Open `CardFilterSheet.tsx` and read it fully.

- [ ] Add the new props to the interface:

```ts
import { type CardFrequency } from '@shared/data/FakeDataStore';

interface CardFilterSheetProps {
  // ...existing props
  frequencyFilter?: CardFrequency | 'all';
  onFrequencyFilterChange?: (v: CardFrequency | 'all') => void;
}
```

- [ ] Add the `ChipGroup` for frequency inside the sheet, after the Ownership section:

```tsx
const frequencyOptions: ChipOption<CardFrequency | 'all'>[] = [
  { key: 'all', label: 'All' },
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'as-needed', label: 'As-needed' },
];

// Inside JSX, after the Ownership ChipGroup block:
{frequencyFilter !== undefined && onFrequencyFilterChange && (
  <>
    <FieldLabel>Frequency</FieldLabel>
    <ChipGroup
      options={frequencyOptions}
      value={frequencyFilter}
      onChange={onFrequencyFilterChange}
      className="mb-8"
    />
  </>
)}
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/components/CardFilterSheet.tsx
git commit -m "feat: add frequency chip group to CardFilterSheet"
```

---

### Task 4: Wire up in `CardsScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

- [ ] Open `CardsScreen.tsx` and read it fully.

- [ ] Destructure `frequencyFilter` from prefs (alongside the existing destructured values):

```ts
const { filter, taskTimeFilter, hideCompleted, hideUndated, hideEmptyCards, frequencyFilter } = prefs;
```

- [ ] Pass `frequencyFilter` to `useCardsFiltering`:

```ts
const { filteredCards, getCardTasks } = useCardsFiltering({
  cards,
  tasks,
  filter,
  taskTimeFilter,
  hideEmptyCards,
  hideCompleted,
  hideUndated,
  currentUser,
  searchQuery,
  frequencyFilter,   // ← add this
});
```

- [ ] Pass it to `CardFilterSheet`:

```tsx
<CardFilterSheet
  // ...existing props
  frequencyFilter={frequencyFilter}
  onFrequencyFilterChange={(v) => updateFilter({ frequencyFilter: v })}
/>
```

- [ ] Add `frequencyFilter !== 'all'` to the active-filter dot condition:

```tsx
{(filter !== 'all' ||
  taskTimeFilter !== 'hidden' ||
  hideEmptyCards ||
  hideCompleted ||
  hideUndated ||
  frequencyFilter !== 'all') && (   // ← add this
  <View className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-surface" />
)}
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: wire frequency filter into CardsScreen"
```
