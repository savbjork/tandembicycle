# Don't Use / Archive During Sort Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Don't use" button to SwipeModeScreen that archives a card during sorting, excluding it from the household card list permanently (soft-delete).

**Architecture:** Add `archived` boolean to the Card type, add `archiveCard` store action, track archived card names during shuffle in `useCardShuffle`, filter archived cards from `useCardsFiltering`, and add the "Don't use" button to `SwipeModeScreen`. On sort completion, archived cards are excluded from `reassignCards`/`resetToDefaults` and the store action persists them as archived in Supabase.

**Tech Stack:** React Native, TypeScript, Zustand, Supabase, Expo

---

### Task 1: Add `archived` field to Card type and `archiveCard` dataStore action

**Files:**
- Modify: `tandem-mobile/src/shared/data/FakeDataStore.ts`
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`

**Step 1: Add `archived` to Card interface in FakeDataStore.ts**

The `Card` interface currently is:
```typescript
export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    note?: string;
}
```

Add `archived?: boolean`:
```typescript
export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    note?: string;
    archived?: boolean;
}
```

**Step 2: Add `archiveCard` to the DataState interface in dataStore.ts**

In the `DataState` interface under `// ── Card Actions`, add:
```typescript
archiveCard: (name: string) => void;
```

**Step 3: Implement `archiveCard` in the store**

After `removeCard`, add:
```typescript
archiveCard: (name) =>
    set((state) => {
        const card = state.cards.find((c) => c.name === name);
        const newCards = state.cards.map((c) =>
            c.name === name ? { ...c, archived: true } : c
        );
        fakeData.cards = newCards;

        if (card?.dbId) {
            supabase.from('cards').update({ archived: true }).eq('id', card.dbId);
        }

        return { cards: newCards };
    }),
```

**Step 4: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No new errors (pre-existing 5 errors in unrelated files are fine)

**Step 5: Commit**

```bash
git add tandem-mobile/src/shared/data/FakeDataStore.ts tandem-mobile/src/store/slices/dataStore.ts
git commit -m "feat: add archived field to Card type and archiveCard store action"
```

---

### Task 2: Filter archived cards from `useCardsFiltering`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts`

**Step 1: Add archived filter to filteredCards**

In the `filteredCards` useMemo, the current first filter is:
```typescript
const matchesOwnership = filter === 'all' ? true : c.owner === currentUser;
if (!matchesOwnership) return false;
```

Add an archived check before the ownership check:
```typescript
if (c.archived) return false;
const matchesOwnership = filter === 'all' ? true : c.owner === currentUser;
if (!matchesOwnership) return false;
```

**Step 2: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts
git commit -m "feat: filter archived cards from card list"
```

---

### Task 3: Add archive tracking to `useCardShuffle`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Add `archiveCard` prop to `UseCardShuffleProps`**

Add to the interface:
```typescript
archiveCard: (name: string) => void;
```

Full updated interface:
```typescript
interface UseCardShuffleProps {
    cards: Card[];
    reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
    resetToDefaults: (freshCards: Card[], freshTasks: Task[]) => void;
    archiveCard: (name: string) => void;
    onShuffleEnd?: () => void;
}
```

**Step 2: Destructure `archiveCard` in the hook**

Update the hook signature:
```typescript
export const useCardShuffle = ({
    cards,
    reassignCards,
    resetToDefaults,
    archiveCard,
    onShuffleEnd,
}: UseCardShuffleProps) => {
```

**Step 3: Add `archivedCardNames` state**

After the existing `useState` declarations, add:
```typescript
const [archivedCardNames, setArchivedCardNames] = useState<string[]>([]);
```

**Step 4: Add `markCardArchived` callback**

Add after `assignCard`:
```typescript
const markCardArchived = useCallback((cardIndex: number) => {
    const cardName = shuffledCards[cardIndex]?.name;
    if (cardName) {
        setArchivedCardNames(prev => [...prev, cardName]);
    }
    setCurrentCardIndex(cardIndex + 1);
}, [shuffledCards]);
```

**Step 5: Update `finishShuffle` to exclude and archive cards**

Replace the existing `finishShuffle`:
```typescript
const finishShuffle = useCallback((updatedCards: typeof shuffledCards) => {
    const nonArchivedCards = updatedCards.filter(c => !archivedCardNames.includes(c.name));

    if (isDefaultsMode) {
        const freshCards: Card[] = nonArchivedCards.map(c => ({ name: c.name, owner: c.owner }));
        resetToDefaults(freshCards, []);
    } else {
        reassignCards(nonArchivedCards.map(c => ({ name: c.name, owner: c.owner })));
        archivedCardNames.forEach(name => archiveCard(name));
    }

    setArchivedCardNames([]);
    setIsDefaultsMode(false);
    setShowSwipeMode(false);
    setCurrentCardIndex(0);
    if (onShuffleEnd) onShuffleEnd();
}, [isDefaultsMode, archivedCardNames, reassignCards, resetToDefaults, archiveCard, onShuffleEnd]);
```

Note: In defaults mode, archived cards are just excluded (they don't exist in the DB yet). In reassign mode, `archiveCard` is called for each archived name so the DB is updated.

**Step 6: Update `cancelSwipe` to reset `archivedCardNames`**

Replace the existing `cancelSwipe`:
```typescript
const cancelSwipe = useCallback(() => {
    setArchivedCardNames([]);
    setIsDefaultsMode(false);
    setShowSwipeMode(false);
}, []);
```

**Step 7: Also reset `archivedCardNames` in `startSwipeShuffle` and `startWithDefaults`**

Update `startSwipeShuffle` to add `setArchivedCardNames([]);` as the first line:
```typescript
const startSwipeShuffle = useCallback((cardsToShuffle: Card[] = cards) => {
    setArchivedCardNames([]);
    setIsDefaultsMode(false);
    setShowShuffleModal(false);
    setShuffledCards([...cardsToShuffle]);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
}, [cards]);
```

Update `startWithDefaults` to add `setArchivedCardNames([]);` as the first line:
```typescript
const startWithDefaults = useCallback(() => {
    setArchivedCardNames([]);
    const defaultCardObjects = DEFAULT_CARDS.map(name => ({ name, owner: currentUser }));
    setIsDefaultsMode(true);
    setShuffledCards(defaultCardObjects);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
}, [currentUser]);
```

**Step 8: Export `markCardArchived` from the hook return**

Add `markCardArchived` to the return object.

**Step 9: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No new errors (there will be a TypeScript error in CardsScreen about missing `archiveCard` prop — that's expected and will be fixed in Task 5)

**Step 10: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: track archived cards during shuffle in useCardShuffle"
```

---

### Task 4: Add "Don't use" button to `SwipeModeScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx`

**Step 1: Add `onArchive` prop to `SwipeModeScreenProps`**

Update the interface:
```typescript
interface SwipeModeScreenProps {
    visible: boolean;
    onClose: () => void;
    shuffledCards: Array<{ name: string, owner: Person }>;
    currentCardIndex: number;
    members: Person[];
    onAssign: (cardIndex: number, owner: Person) => void;
    onArchive: (cardIndex: number) => void;
    onSwipedAll: (updatedCards: Array<{ name: string, owner: Person }>) => void;
}
```

**Step 2: Destructure `onArchive` in the component**

```typescript
export const SwipeModeScreen: React.FC<SwipeModeScreenProps> = ({
    visible,
    onClose,
    shuffledCards,
    currentCardIndex,
    members,
    onAssign,
    onArchive,
    onSwipedAll,
}) => {
```

**Step 3: Add `handleArchive` handler**

After the existing `handleAssign` function, add:
```typescript
const handleArchive = () => {
    onArchive(currentCardIndex);

    if (isLastCard) {
        setTimeout(() => {
            onSwipedAll(shuffledCards);
        }, 100);
    }
};
```

**Step 4: Add "Don't use" button to the UI**

In the render, after the `{members.map(...)}` block and before the closing `</View>` of the `gap-4` View, add:

```tsx
<TouchableOpacity
    onPress={handleArchive}
    className="py-4 rounded-2xl flex-row items-center justify-center border border-border bg-surface active:opacity-80"
>
    <Text className="text-text-secondary text-base font-semibold">Don't use</Text>
</TouchableOpacity>
```

**Step 5: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: Error in `CardsScreen.tsx` about missing `onArchive` prop on SwipeModeScreen — expected, fixed in Task 5. No new errors in `SwipeModeScreen.tsx`.

**Step 6: Commit**

```bash
git add tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx
git commit -m "feat: add Don't use button to SwipeModeScreen"
```

---

### Task 5: Wire everything in `CardsScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Step 1: Destructure `archiveCard` from `useDataStore`**

The existing destructure is:
```typescript
const { cards, tasks, toggleTaskDone, reassignCards, resetToDefaults } = useDataStore();
```

Update to:
```typescript
const { cards, tasks, toggleTaskDone, reassignCards, resetToDefaults, archiveCard } = useDataStore();
```

**Step 2: Pass `archiveCard` to `useCardShuffle`**

The existing hook call is:
```typescript
const {
    ...
} = useCardShuffle({
    cards,
    reassignCards,
    resetToDefaults,
    onShuffleEnd,
});
```

Add `archiveCard`:
```typescript
const {
    ...
} = useCardShuffle({
    cards,
    reassignCards,
    resetToDefaults,
    archiveCard,
    onShuffleEnd,
});
```

**Step 3: Destructure `markCardArchived` from `useCardShuffle`**

Add `markCardArchived` to the destructured values from `useCardShuffle`.

**Step 4: Pass `onArchive` to `SwipeModeScreen`**

Find the `<SwipeModeScreen ... />` render. Add the `onArchive` prop:
```tsx
<SwipeModeScreen
    visible={showSwipeMode}
    onClose={cancelSwipe}
    shuffledCards={shuffledCards}
    currentCardIndex={currentCardIndex}
    members={householdMembers}
    onAssign={assignCard}
    onArchive={markCardArchived}
    onSwipedAll={finishShuffle}
/>
```

**Step 5: Verify TypeScript compiles cleanly**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No new errors — the missing prop errors from Tasks 3 and 4 should now be resolved.

**Step 6: Manual verification checklist**

- [ ] During regular shuffle: "Don't use" button appears below member buttons on every card
- [ ] Press "Don't use" on a card: advances to next card, card does not appear in household list after completing sort
- [ ] Press "Don't use" on the last card: sort completes correctly
- [ ] Press "Don't use" during defaults sort: archived cards excluded from final saved cards
- [ ] Press X during sort: no cards archived, existing cards unchanged
- [ ] Archived card is invisible in the card list (CardsScreen shows no archived cards)
- [ ] Regular member assignment still works correctly alongside "Don't use"

**Step 7: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: wire archive during sort into CardsScreen"
```
