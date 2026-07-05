# Default Cards Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** When a household has 0 cards, show a "Start with defaults" button; pressing it (or "Restart with defaults") launches SwipeModeScreen with 24 default cards for assignment — saving only on full completion, discarding on X.

**Architecture:** Add `isDefaultsMode` flag and `startWithDefaults()` to `useCardShuffle`, update `handleFreshStart` to launch swipe mode instead of hard-resetting, and add an empty-state button in `CardsScreen`.

**Tech Stack:** React Native, TypeScript, Zustand, Expo

---

### Task 1: Add DEFAULT_CARDS constant and `startWithDefaults` to `useCardShuffle`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Add `DEFAULT_CARDS` constant at the top of the file (after imports)**

Add this constant before the `useCardShuffle` function definition:

```typescript
export const DEFAULT_CARDS = [
    'House maintenance',
    'Car maintenance',
    'Bathroom deep clean',
    'Mop',
    'Vacuum',
    'Cook dinner',
    'Laundry',
    'Take out trash',
    'Family events',
    'Family holiday/birthday gifts',
    'Grocery shopping',
    'Cleaning supplies',
    'Plan dates',
    'Car insurance',
    'Rental Insurance',
    'Internet',
    'Dishes',
    'Kitchen deep clean',
    'Pay credit card bills',
    'Manage budget',
    'Retirement',
    'Investing',
    'Taxes',
    'Clean out fridge',
] as const;
```

**Step 2: Add `isDefaultsMode` state inside the hook**

After the existing `useState` declarations, add:

```typescript
const [isDefaultsMode, setIsDefaultsMode] = useState(false);
```

**Step 3: Add `startWithDefaults` function**

Add this after `startSwipeShuffle`:

```typescript
const startWithDefaults = useCallback(() => {
    const defaultCardObjects = DEFAULT_CARDS.map(name => ({ name, owner: currentUser }));
    setIsDefaultsMode(true);
    setShuffledCards(defaultCardObjects);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
}, [currentUser]);
```

**Step 4: Return `startWithDefaults` from the hook**

Add `startWithDefaults` to the return object at the bottom of the hook.

**Step 5: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No errors related to `useCardShuffle.ts`

**Step 6: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: add DEFAULT_CARDS constant and startWithDefaults to useCardShuffle"
```

---

### Task 2: Update `finishShuffle` to handle defaults mode

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Update `finishShuffle` to branch on `isDefaultsMode`**

Replace the existing `finishShuffle` implementation:

```typescript
const finishShuffle = useCallback((updatedCards: typeof shuffledCards) => {
    if (isDefaultsMode) {
        const freshCards: Card[] = updatedCards.map(c => ({ name: c.name, owner: c.owner }));
        resetToDefaults(freshCards, []);
        setIsDefaultsMode(false);
    } else {
        reassignCards(updatedCards.map(c => ({ name: c.name, owner: c.owner })));
    }
    setShowSwipeMode(false);
    setCurrentCardIndex(0);
    if (onShuffleEnd) onShuffleEnd();
}, [isDefaultsMode, reassignCards, resetToDefaults, onShuffleEnd]);
```

Note: `isDefaultsMode` must be added to the dependency array. Also add `resetToDefaults` to the `UseCardShuffleProps` interface if it isn't already there — it is already present, so no interface change needed.

**Step 2: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: finishShuffle calls resetToDefaults when in defaults mode"
```

---

### Task 3: Update `handleFreshStart` to launch sorting instead of hard-resetting

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Replace `handleFreshStart` implementation**

The current implementation calls `resetToDefaults` directly with a hardcoded mini deck. Replace it so it calls `startWithDefaults` after confirmation:

```typescript
const handleFreshStart = useCallback(() => {
    Alert.alert(
        'Fresh Start?',
        'This will delete ALL current cards and reset to a standard deck. This cannot be undone.',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Reset Everything',
                style: 'destructive',
                onPress: () => {
                    setShowShuffleModal(false);
                    startWithDefaults();
                },
            },
        ],
    );
}, [startWithDefaults]);
```

Note: `startWithDefaults` must be defined before `handleFreshStart` in the file. The existing code already has `startSwipeShuffle` defined before `handleFreshStart`, and `startWithDefaults` was added after `startSwipeShuffle` in Task 1, so ordering is correct.

**Step 2: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: handleFreshStart launches sorting flow instead of hard-resetting"
```

---

### Task 4: Add empty-state "Start with defaults" button to `CardsScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Step 1: Destructure `startWithDefaults` from `useCardShuffle`**

In `CardsScreen`, the hook is already called as:
```typescript
const {
    showShuffleModal,
    ...
    handleFreshStart,
} = useCardShuffle({ ... });
```

Add `startWithDefaults` to the destructured values.

**Step 2: Add empty-state UI in the ScrollView**

The current card list render in the ScrollView is:
```tsx
<View className="mb-6">
  {filteredCards.map((card, i) => (
    <CardListItem ... />
  ))}
</View>
```

Replace this block with:
```tsx
<View className="mb-6">
  {cards.length === 0 ? (
    <View className="flex-1 items-center justify-center pt-20">
      <TouchableOpacity
        className="bg-primary-600 px-8 py-4 rounded-2xl shadow-md active:opacity-90"
        onPress={startWithDefaults}
      >
        <Text className="text-white text-lg font-bold">Start with defaults</Text>
      </TouchableOpacity>
    </View>
  ) : (
    filteredCards.map((card, i) => (
      <CardListItem
        key={`${card.name}-${i}`}
        card={card}
        tasks={getCardTasks(card.name)}
        isSelecting={isSelecting}
        isSelected={selectedCardNames.includes(card.name)}
        onPress={() => navigation.navigate('CardDetail', { cardName: card.name })}
        onToggleSelection={() => toggleCardSelection(card.name)}
        showOwnerBadge={filter === 'all'}
        showTasks={taskTimeFilter !== 'hidden'}
        onToggleTaskDone={(taskId) => handleToggleDone(taskId)}
      />
    ))
  )}
</View>
```

Note: The condition is `cards.length === 0` (not `filteredCards.length === 0`) so filters don't accidentally show the empty state when cards exist but are filtered out.

**Step 3: Verify TypeScript compiles**

Run: `cd tandem-mobile && npx tsc --noEmit`
Expected: No errors

**Step 4: Manual verification checklist**

- [ ] With 0 cards: "Start with defaults" button appears centered on screen
- [ ] Press "Start with defaults": SwipeModeScreen opens with first of 24 default cards
- [ ] Assign all 24 cards: cards are saved, SwipeModeScreen closes, card list shows 24 cards
- [ ] Press "Start with defaults", then press X mid-sort: closes, still 0 cards
- [ ] With cards present, open shuffle menu → "Restart with defaults" → confirm alert → SwipeModeScreen opens with 24 default cards
- [ ] Complete sort after "Restart with defaults": all previous cards replaced with 24 new ones, tasks cleared
- [ ] X out of "Restart with defaults" sort mid-way: original cards unchanged
- [ ] Regular "Reassign entire existing deck" shuffle still works as before

**Step 5: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: show start with defaults button when household has no cards"
```
