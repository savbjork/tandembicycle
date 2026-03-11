# Cards Scale Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Cards screen usable at 80-100 cards with four improvements: progress indicator in swipe mode, "Assign all to me" bulk action, search by card name, and FlatList virtualization.

**Architecture:** All changes are contained to `features/cards/`. Tasks 1-3 are UI-only additions. Task 4 (FlatList) restructures CardsScreen's list rendering. Each task is independent and can be committed separately.

**Tech Stack:** React Native, NativeWind (Tailwind classes), TypeScript strict mode

---

### Task 1: Progress indicator in swipe mode

Show "X / Y" card progress in the swipe mode header so users know how far through the deck they are.

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx:64-73`

**Step 1: Add progress text to the header**

In `SwipeModeScreen.tsx`, the header row (lines 65-73) has an empty `<View>` on the left and the close button on the right. Replace the empty view with progress text:

```tsx
<View className="flex-row justify-between items-center mb-10">
    <Text className="text-sm font-semibold text-text-muted">
        {currentCardIndex + 1} / {shuffledCards.length}
    </Text>
    <TouchableOpacity
        onPress={onClose}
        className="bg-surface w-10 h-10 rounded-full items-center justify-center border border-border"
    >
        <Ionicons name="close" size={24} color={COLORS.text.muted} />
    </TouchableOpacity>
</View>
```

**Step 2: Verify visually**

Run `npm run ios` in `tandem-mobile/`. Open the shuffle modal, start "Reassign entire existing deck". Confirm "1 / N" appears top-left, increments with each assignment.

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx
git commit -m "feat: add progress indicator to swipe mode screen"
```

---

### Task 2: "Assign all to me" bulk action in selective shuffle

When in selection mode with cards selected, add a second button that assigns all selected cards to the current user instantly (no swipe-through).

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx:41,100-102,201-215`

**Step 1: Wire up bulk assign handler**

In `CardsScreen.tsx`, `reassignCards` is already destructured from `useDataStore` (line 41) and `currentUser` is available from `useCurrentUser` (line 40). Add a handler below `handleSelectiveShuffle`:

```tsx
const handleAssignAllToMe = () => {
    const assignments = selectedCardNames.map(name => ({ name, owner: currentUser as Person }));
    reassignCards(assignments);
    setIsSelecting(false);
    setSelectedCardNames([]);
};
```

Note: `Person` is already imported via `@shared/data/FakeDataStore` through `useCardShuffle` — you need to add the import explicitly at the top if it isn't there. Check line 1-14 of CardsScreen.tsx. If `Person` isn't imported, add it:
```tsx
import { type Person } from '@shared/data/FakeDataStore';
```

**Step 2: Add the button to the floating action area**

The floating bottom section (lines 201-215) currently has one button. Replace it with two buttons stacked vertically:

```tsx
{isSelecting && (
    <View className="absolute bottom-10 left-5 right-5 gap-3">
        <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-primary-600' : 'bg-border'}`}
            disabled={selectedCardNames.length === 0}
            onPress={handleAssignAllToMe}
        >
            <Text className="text-white font-bold text-lg">
                Assign all to me ({selectedCardNames.length})
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-secondary-600' : 'bg-border'}`}
            disabled={selectedCardNames.length === 0}
            onPress={handleSelectiveShuffle}
        >
            <Text className="text-white font-bold text-lg">
                Assign one by one ({selectedCardNames.length})
            </Text>
        </TouchableOpacity>
    </View>
)}
```

**Step 3: Verify visually**

In the app: tap shuffle icon → "Choose specific cards to assign" → select a few cards. Confirm two buttons appear. Tap "Assign all to me" — cards should update immediately with no swipe modal. Tap "Assign one by one" — swipe mode should open as before.

**Step 4: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: add assign-all-to-me bulk action in selective shuffle"
```

---

### Task 3: Search by card name

Add a live text search input at the top of the cards list that filters cards by name as you type.

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts`
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Step 1: Add searchQuery to useCardsFiltering**

In `useCardsFiltering.ts`, add `searchQuery: string` to the `UseCardsFilteringProps` interface and filter it in the `useMemo`:

```ts
interface UseCardsFilteringProps {
    cards: Card[];
    tasks: Task[];
    filter: CardsFilter;
    taskTimeFilter: TaskTimeFilter;
    hideEmptyCards: boolean;
    hideCompleted: boolean;
    hideUndated: boolean;
    currentUser: string;
    searchQuery: string;  // ADD THIS
}
```

In the `filtered` array filter chain, add a search check after the archived check:

```ts
const filtered = cards.filter((c: Card) => {
    if (c.archived) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // ... rest of existing filters unchanged
```

Add `searchQuery` to the `useMemo` dependency array at line 63.

**Step 2: Add search state and input to CardsScreen**

In `CardsScreen.tsx`:

Add state at the top of the component (near the other useState calls):
```tsx
const [searchQuery, setSearchQuery] = useState('');
```

Pass it to `useCardsFiltering`:
```tsx
const { filteredCards, getCardTasks } = useCardsFiltering({
    cards,
    tasks,
    filter,
    taskTimeFilter,
    hideEmptyCards,
    hideCompleted,
    hideUndated,
    currentUser,
    searchQuery,  // ADD THIS
});
```

Add the search input to the JSX. Place it directly inside `<ScrollView>`, before the `NavigationRow` (after `<ScrollView className="flex-1 px-5 pb-5">`):

```tsx
{!isSelecting && (
    <View className="mb-4 mt-1">
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2 gap-2">
            <Ionicons name="search" size={18} color={COLORS.text.muted} />
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search cards..."
                placeholderTextColor={COLORS.text.muted}
                className="flex-1 text-base text-text"
                autoCorrect={false}
                autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
            )}
        </View>
    </View>
)}
```

You need to add `TextInput` to the React Native import at the top of CardsScreen.tsx:
```tsx
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
```

**Step 3: Clear search when leaving selection mode**

In the cancel handler (around line 112), add `setSearchQuery('')`:
```tsx
onPress={() => {
    setIsSelecting(false);
    setSelectedCardNames([]);
    setSearchQuery('');
}}
```

**Step 4: Verify visually**

Run the app. On the Cards screen, type "laundry" in the search box — list should filter live. Clear with the X button — full list returns.

**Step 5: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts \
        tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: add live search filter to cards screen"
```

---

### Task 4: FlatList virtualization

Replace `ScrollView` with `FlatList` so only visible cards are rendered, improving performance at 80-100 cards.

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Background:** `ScrollView` mounts all children at once. `FlatList` virtualizes — only visible items plus a small buffer are in the render tree. For 80-100 cards with inline tasks, this meaningfully reduces mount time and memory. `FlatList` uses `data` + `renderItem` instead of `.map()`, and `ListHeaderComponent` / `ListFooterComponent` for non-list content that currently sits inside the ScrollView.

**Step 1: Swap the import**

Change:
```tsx
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
```
To:
```tsx
import { View, FlatList, TouchableOpacity, TextInput } from 'react-native';
```

**Step 2: Build the list header component**

Create a header element (as a variable, not a component, to avoid re-mount issues) right before the return statement:

```tsx
const listHeader = !isSelecting ? (
    <View>
        <View className="mb-4 mt-1">
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2 gap-2">
                <Ionicons name="search" size={18} color={COLORS.text.muted} />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search cards..."
                    placeholderTextColor={COLORS.text.muted}
                    className="flex-1 text-base text-text"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
        <NavigationRow
            onNavigateTasks={() => navigation.navigate('Tasks')}
            onNavigateInbox={() => navigation.navigate('Inbox')}
            onNavigateHome={() => navigation.navigate('Profile')}
        />
        {filter === 'all' && (
            <BalanceMeter
                cards={cards}
                currentUser={currentUser}
                partner={partner}
            />
        )}
    </View>
) : null;
```

**Step 3: Build the list footer component**

```tsx
const listFooter = !isSelecting ? (
    <View>
        <TouchableOpacity
            onPress={() => navigation.navigate('ArchivedCards')}
            className="items-center flex-row justify-center gap-2 py-4 mb-6"
        >
            <Ionicons name="archive-outline" size={16} color={COLORS.text.muted} />
            <Text className="text-sm text-text-muted">Archive</Text>
        </TouchableOpacity>
        <View className="h-20" />
    </View>
) : <View className="h-20" />;
```

**Step 4: Replace ScrollView with FlatList**

Remove the existing `<ScrollView>` block (lines 145-199) and replace with:

```tsx
<FlatList
    className="flex-1 px-5"
    data={filteredCards}
    keyExtractor={(card, i) => `${card.name}-${i}`}
    ListHeaderComponent={listHeader}
    ListFooterComponent={listFooter}
    ListEmptyComponent={
        cards.filter(c => !c.archived).length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
                <TouchableOpacity
                    className="bg-primary-600 px-8 py-4 rounded-2xl shadow-md active:opacity-90"
                    onPress={startWithDefaults}
                >
                    <Text className="text-white text-lg font-bold">Start with defaults</Text>
                </TouchableOpacity>
            </View>
        ) : null
    }
    renderItem={({ item: card, index: i }) => (
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
    )}
    contentContainerStyle={{ paddingBottom: isSelecting ? 160 : 0 }}
/>
```

Note: The `mb-6` wrapper `<View>` around the cards map is gone — FlatList handles spacing via `ItemSeparatorComponent` or margin on `CardListItem` itself. `CardListItem` already has `mb-3` so that's fine.

**Step 5: Verify visually**

Run the app. Cards screen should look identical. Scroll should be smooth. BalanceMeter and NavigationRow should appear above the list. Archive link should appear below. The floating shuffle/assign buttons (absolutely positioned) are unaffected.

If the search input from Task 3 is now inside `listHeader`, remove the duplicate from where it was placed inline in the ScrollView.

**Step 6: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "perf: replace ScrollView with FlatList for virtualized card rendering"
```
