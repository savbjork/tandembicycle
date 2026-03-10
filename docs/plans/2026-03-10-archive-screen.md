# Archive Screen Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an archive screen accessible from the bottom of the Cards page where users can view archived cards, see days until permanent deletion (30 days), and restore cards.

**Architecture:** Add `archivedAt` to the Card type and store, wire a new `ArchivedCardsScreen` into the navigation stack, and add a bottom button on `CardsScreen` to navigate to it.

**Tech Stack:** React Native, NativeWind (Tailwind class names), Zustand (dataStore), React Navigation (native stack), Supabase, Expo Ionicons, TypeScript.

---

### Task 1: Add `archivedAt` to Card type and update `archiveCard` + add `unarchiveCard`

**Files:**
- Modify: `tandem-mobile/src/shared/data/FakeDataStore.ts`
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`

**Step 1: Add `archivedAt` to Card interface**

In `tandem-mobile/src/shared/data/FakeDataStore.ts`, update the `Card` interface:

```ts
export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    note?: string;
    archived?: boolean;
    archivedAt?: string; // ISO date string, set when card is archived
}
```

**Step 2: Update `archiveCard` in the store to set `archivedAt`**

In `tandem-mobile/src/store/slices/dataStore.ts`, update the `archiveCard` action:

```ts
archiveCard: (name) =>
    set((state) => {
        const card = state.cards.find((c) => c.name === name);
        const archivedAt = new Date().toISOString();
        const newCards = state.cards.map((c) =>
            c.name === name ? { ...c, archived: true, archivedAt } : c
        );
        fakeData.cards = newCards;

        if (card?.dbId) {
            supabase.from('cards').update({ is_archived: true, archived_at: archivedAt }).eq('id', card.dbId);
        }

        return { cards: newCards };
    }),
```

**Step 3: Add `unarchiveCard` to the DataState interface**

In `tandem-mobile/src/store/slices/dataStore.ts`, add to the `DataState` interface (in the `// ── Card Actions` section):

```ts
unarchiveCard: (names: string[]) => void;
```

**Step 4: Implement `unarchiveCard` in the store**

In `tandem-mobile/src/store/slices/dataStore.ts`, add after the `archiveCard` implementation:

```ts
unarchiveCard: (names) =>
    set((state) => {
        const newCards = state.cards.map((c) =>
            names.includes(c.name) ? { ...c, archived: false, archivedAt: undefined } : c
        );
        fakeData.cards = newCards;

        names.forEach((name) => {
            const card = state.cards.find((c) => c.name === name);
            if (card?.dbId) {
                supabase.from('cards').update({ is_archived: false, archived_at: null }).eq('id', card.dbId);
            }
        });

        return { cards: newCards };
    }),
```

**Step 5: Commit**

```bash
git add tandem-mobile/src/shared/data/FakeDataStore.ts tandem-mobile/src/store/slices/dataStore.ts
git commit -m "feat: add archivedAt to Card type and unarchiveCard action"
```

---

### Task 2: Add `ArchivedCards` to navigation types and register the screen

**Files:**
- Modify: `tandem-mobile/src/app/navigation/types.ts`
- Modify: `tandem-mobile/src/app/navigation/stacks/MainStackNavigator.tsx`

**Step 1: Add `ArchivedCards` to `MainStackParamList`**

In `tandem-mobile/src/app/navigation/types.ts`, update `MainStackParamList`:

```ts
export type MainStackParamList = {
  CardsList: undefined;
  CardDetail: { cardName: string };
  ArchivedCards: undefined;
  Tasks: undefined;
  Inbox: undefined;
  Profile: undefined;
};
```

**Step 2: Register `ArchivedCardsScreen` in the stack navigator**

In `tandem-mobile/src/app/navigation/stacks/MainStackNavigator.tsx`, add the import and screen:

```ts
import { ArchivedCardsScreen } from '@features/cards/screens/ArchivedCardsScreen';
```

Inside `Stack.Navigator`, add after the `CardDetail` screen:

```tsx
<Stack.Screen
    name="ArchivedCards"
    component={ArchivedCardsScreen}
/>
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/app/navigation/types.ts tandem-mobile/src/app/navigation/stacks/MainStackNavigator.tsx
git commit -m "feat: add ArchivedCards route to navigation"
```

---

### Task 3: Create `ArchivedCardsScreen`

**Files:**
- Create: `tandem-mobile/src/features/cards/screens/ArchivedCardsScreen.tsx`

**Step 1: Create the screen file**

```tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ScreenHeader } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useNavigation } from '@react-navigation/native';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function daysRemaining(archivedAt: string): number {
  const archived = new Date(archivedAt).getTime();
  const now = Date.now();
  const elapsed = now - archived;
  return Math.max(0, Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000)));
}

export const ArchivedCardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { cards, removeCard, unarchiveCard } = useDataStore();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // On mount: permanently delete cards archived more than 30 days ago
  useEffect(() => {
    const expired = cards.filter(
      (c) => c.archived && c.archivedAt && daysRemaining(c.archivedAt) === 0
    );
    expired.forEach((c) => removeCard(c.name));
  }, []);

  const archivedCards = cards
    .filter((c) => c.archived && c.archivedAt)
    .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime());

  const toggleSelection = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleRestore = () => {
    unarchiveCard(selectedNames);
    setSelectedNames([]);
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title="Archive"
        leftAction={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-11 h-11 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
        }
        rightAction={
          selectedNames.length > 0 ? (
            <TouchableOpacity
              onPress={handleRestore}
              className="bg-primary-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-semibold">
                Restore ({selectedNames.length})
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {archivedCards.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-text-muted text-base">No archived cards</Text>
          </View>
        ) : (
          <View className="mb-6">
            {archivedCards.map((card) => {
              const isSelected = selectedNames.includes(card.name);
              const days = daysRemaining(card.archivedAt!);
              return (
                <TouchableOpacity
                  key={card.name}
                  onPress={() => toggleSelection(card.name)}
                  className={`bg-surface p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
                    isSelected ? 'border-primary-600' : 'border-border-light'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
                    />
                    <View className="flex-1">
                      <Text className="text-[17px] font-bold text-text">{card.name}</Text>
                      <Text className="text-xs text-text-muted mt-0.5">
                        Deletes in {days} day{days !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
```

**Step 2: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/ArchivedCardsScreen.tsx
git commit -m "feat: add ArchivedCardsScreen with multi-select restore and 30-day expiry"
```

---

### Task 4: Add Archive button at the bottom of `CardsScreen`

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Step 1: Add navigation type import if not present**

The file already imports `useNavigation` and `CompositeNavigationProp` — no change needed.

**Step 2: Add the Archive button inside the ScrollView, after the card list**

In `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`, replace the spacer at the end of the `ScrollView`:

Find this block (lines 192–193):
```tsx
        <View className="h-20" />
      </ScrollView>
```

Replace with:
```tsx
        {!isSelecting && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ArchivedCards')}
            className="items-center flex-row justify-center gap-2 py-4 mb-6"
          >
            <Ionicons name="archive-outline" size={16} color={COLORS.text.muted} />
            <Text className="text-sm text-text-muted">Archive</Text>
          </TouchableOpacity>
        )}
        <View className="h-20" />
      </ScrollView>
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: add Archive button to bottom of CardsScreen"
```

---

### Task 5: Manual verification checklist

- [ ] Open Cards screen — "Archive" button visible at bottom in muted style
- [ ] Archive a card via the swipe shuffle "Don't use" flow — card disappears from active list
- [ ] Tap Archive — archived card appears with "Deletes in 30 days"
- [ ] Tap one or more cards — checkboxes fill, "Restore (N)" appears in header
- [ ] Tap Restore — cards return to active list, disappear from archive screen
- [ ] Verify back button returns to Cards screen
