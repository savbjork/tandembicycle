# Supabase Data Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the in-memory FakeDataStore + string-based Person types with real Supabase queries, UUID-based data models, and Realtime subscriptions — keeping screen changes minimal by preserving Zustand store action names.

**Architecture:** Define DB-aligned types in `src/lib/types.ts`, build a thin Supabase service layer, rewrite the Zustand `dataStore` to call those services, then update screens/hooks that depend on the old string-based owner/card references. Realtime subscriptions live inside the dataStore and keep the local cache in sync automatically.

**Tech Stack:** `@supabase/supabase-js`, Zustand, React Native/Expo, TypeScript

---

## Critical data model changes to understand before touching any code

The current model uses display-name strings as identifiers everywhere:
- `Card.owner: 'Savannah' | 'Kevin'` → becomes `owner_id: uuid`
- `Task.card: string (card name)` → becomes `card_id: string ('card-<uuid>')`
- `Task.owner: 'Savannah' | 'Kevin'` → becomes `owner_id: uuid`
- `DropZoneItem.sender/receiver: Person` → becomes `sender_id/receiver_id: uuid`
- Navigation param `CardDetail: { cardName }` → `CardDetail: { cardId }`

The DB trigger `tasks_card_owner_sync` (function: `sync_task_card_owner`) automatically cascades `owner_id` to tasks when a card is reassigned — so `reassignCards` only needs to update `cards.owner_id`, not tasks.

Renaming a card no longer needs to update tasks (tasks reference by `card_id`, not name).

---

## Task 1: Define app-level types

**Files:**
- Create: `tandem-mobile/src/lib/types.ts`

**Step 1: Create the file**

```typescript
// tandem-mobile/src/lib/types.ts

export interface Profile {
    id: string;           // 'usr-<uuid>'
    user_id: string;      // auth UUID — use this for owner comparisons
    display_name: string;
    email: string;
    avatar_url: string | null;
    created_at: string;
}

export interface HouseholdMember {
    id: string;           // 'hm-<uuid>'
    household_id: string;
    user_id: string;      // auth UUID
    role: 'owner' | 'member';
    joined_at: string;
    profile: Pick<Profile, 'id' | 'user_id' | 'display_name' | 'avatar_url'>;
}

export interface Card {
    id: string;           // 'card-<uuid>'
    household_id: string;
    name: string;
    owner_id: string;     // auth UUID
    note: string | null;
    is_archived: boolean;
    created_at: string;
}

export interface Task {
    id: string;           // 'task-<uuid>'
    card_id: string;
    household_id: string;
    name: string;
    owner_id: string;     // auth UUID
    due_date: string | null;
    is_done: boolean;
    note: string | null;
    source_message_id: string | null;
    created_at: string;
    updated_at: string;
}

export type MessageStatus = 'pending' | 'converted' | 'dismissed' | 'archived';

export interface Message {
    id: string;           // 'msg-<uuid>'
    household_id: string;
    sender_id: string;    // auth UUID
    receiver_id: string;  // auth UUID
    content: string;
    status: MessageStatus;
    created_at: string;
}
```

**Step 2: Verify file has no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: no errors related to `src/lib/types.ts`

**Step 3: Commit**

```bash
git add tandem-mobile/src/lib/types.ts
git commit -m "feat: add DB-aligned app types"
```

---

## Task 2: Add householdId to authStore

The data store needs the current household ID to query scoped data. This belongs in `authStore` since it's part of the session.

**Files:**
- Modify: `tandem-mobile/src/store/slices/authStore.ts`

**Step 1: Add `householdId` to the state interface and actions**

```typescript
// Add to AuthState interface:
householdId: string | null;
setHouseholdId: (id: string | null) => void;
```

```typescript
// Add to initial state:
householdId: null,

// Add action:
setHouseholdId: (id) => set({ householdId: id }),
```

Also update `clearAuth` to reset `householdId`:
```typescript
clearAuth: () => set({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    householdId: null,
}),
```

**Step 2: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/store/slices/authStore.ts
git commit -m "feat: add householdId to auth store"
```

---

## Task 3: Create service layer — cards

**Files:**
- Create: `tandem-mobile/src/lib/services/cards.service.ts`

**Step 1: Create the file**

```typescript
import { supabase } from '@lib/supabase';
import type { Card } from '@lib/types';

export const cardsService = {
    async fetchAll(householdId: string): Promise<Card[]> {
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('household_id', householdId)
            .eq('is_archived', false)
            .order('created_at', { ascending: true });
        if (error) throw error;
        return data;
    },

    async insert(card: Omit<Card, 'id' | 'created_at'>): Promise<Card> {
        const { data, error } = await supabase
            .from('cards')
            .insert(card)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Omit<Card, 'id' | 'household_id' | 'created_at'>>): Promise<Card> {
        const { data, error } = await supabase
            .from('cards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async archive(id: string): Promise<void> {
        const { error } = await supabase
            .from('cards')
            .update({ is_archived: true })
            .eq('id', id);
        if (error) throw error;
    },
};
```

**Step 2: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/lib/services/cards.service.ts
git commit -m "feat: add cards Supabase service"
```

---

## Task 4: Create service layer — tasks

**Files:**
- Create: `tandem-mobile/src/lib/services/tasks.service.ts`

**Step 1: Create the file**

```typescript
import { supabase } from '@lib/supabase';
import type { Task } from '@lib/types';

export const tasksService = {
    async fetchAll(householdId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('household_id', householdId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async insert(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .insert(task)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Omit<Task, 'id' | 'household_id' | 'card_id' | 'created_at'>>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
```

**Step 2: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/lib/services/tasks.service.ts
git commit -m "feat: add tasks Supabase service"
```

---

## Task 5: Create service layer — messages

**Files:**
- Create: `tandem-mobile/src/lib/services/messages.service.ts`

**Step 1: Create the file**

```typescript
import { supabase } from '@lib/supabase';
import type { Message, MessageStatus } from '@lib/types';

export const messagesService = {
    async fetchAll(householdId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('household_id', householdId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async insert(message: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert(message)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateStatus(id: string, status: MessageStatus): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
```

**Step 2: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/lib/services/messages.service.ts
git commit -m "feat: add messages Supabase service"
```

---

## Task 6: Rewrite dataStore

Replace FakeDataStore initialization and all mutations with Supabase service calls. Keep action names the same where possible.

**Files:**
- Modify: `tandem-mobile/src/store/slices/dataStore.ts`

**Step 1: Rewrite the file**

```typescript
import { create } from 'zustand';
import { supabase } from '@lib/supabase';
import { cardsService } from '@lib/services/cards.service';
import { tasksService } from '@lib/services/tasks.service';
import { messagesService } from '@lib/services/messages.service';
import type { Card, Task, Message, MessageStatus, HouseholdMember } from '@lib/types';

interface DataState {
    cards: Card[];
    tasks: Task[];
    messages: Message[];
    householdMembers: HouseholdMember[];
    isLoading: boolean;
    error: string | null;

    // Lifecycle
    loadAll: (householdId: string) => Promise<void>;
    subscribeToRealtime: (householdId: string) => () => void;

    // Card actions
    addCard: (card: Omit<Card, 'id' | 'created_at'>) => Promise<void>;
    updateCard: (id: string, updates: Partial<Omit<Card, 'id' | 'household_id' | 'created_at'>>) => Promise<void>;
    renameCard: (id: string, newName: string) => Promise<void>;
    archiveCard: (id: string) => Promise<void>;
    reassignCards: (assignments: Array<{ id: string; owner_id: string }>) => Promise<void>;

    // Task actions
    // Returns the created Task so callers (e.g. InboxScreen) can use it immediately (e.g. to set source_message_id).
    addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'household_id' | 'card_id' | 'created_at'>>) => Promise<void>;
    removeTask: (id: string) => Promise<void>;
    toggleTaskDone: (id: string) => Promise<void>;

    // Message actions
    sendMessage: (message: Omit<Message, 'id' | 'created_at'>) => Promise<void>;
    updateMessageStatus: (id: string, status: MessageStatus) => Promise<void>;
    removeMessage: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
    cards: [],
    tasks: [],
    messages: [],
    householdMembers: [],
    isLoading: false,
    error: null,

    // ── Lifecycle ────────────────────────────────────────────────

    loadAll: async (householdId) => {
        set({ isLoading: true, error: null });
        try {
            const [cards, tasks, messages, membersRes] = await Promise.all([
                cardsService.fetchAll(householdId),
                tasksService.fetchAll(householdId),
                messagesService.fetchAll(householdId),
                supabase
                    .from('household_members')
                    .select('*, profile:profiles(id, user_id, display_name, avatar_url)')
                    .eq('household_id', householdId),
            ]);
            if (membersRes.error) throw membersRes.error;
            set({
                cards,
                tasks,
                messages,
                householdMembers: membersRes.data as HouseholdMember[],
            });
        } catch (err) {
            set({ error: err instanceof Error ? err.message : 'Failed to load data' });
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeToRealtime: (householdId) => {
        const channel = supabase
            .channel(`household:${householdId}`)
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'cards',
                filter: `household_id=eq.${householdId}`,
            }, () => cardsService.fetchAll(householdId).then(cards => set({ cards })))
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'tasks',
                filter: `household_id=eq.${householdId}`,
            }, () => tasksService.fetchAll(householdId).then(tasks => set({ tasks })))
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'messages',
                filter: `household_id=eq.${householdId}`,
            }, () => messagesService.fetchAll(householdId).then(messages => set({ messages })))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    },

    // ── Card Actions ─────────────────────────────────────────────

    addCard: async (card) => {
        const created = await cardsService.insert(card);
        set(s => ({ cards: [...s.cards, created] }));
    },

    updateCard: async (id, updates) => {
        const updated = await cardsService.update(id, updates);
        set(s => ({ cards: s.cards.map(c => c.id === id ? updated : c) }));
    },

    renameCard: async (id, newName) => {
        // No need to update tasks — they reference cards by id, not name.
        const updated = await cardsService.update(id, { name: newName });
        set(s => ({ cards: s.cards.map(c => c.id === id ? updated : c) }));
    },

    archiveCard: async (id) => {
        await cardsService.archive(id);
        set(s => ({ cards: s.cards.filter(c => c.id !== id) }));
    },

    reassignCards: async (assignments) => {
        // DB trigger tasks_card_owner_sync (function: sync_task_card_owner) cascades owner_id to tasks automatically.
        await Promise.all(
            assignments.map(({ id, owner_id }) => cardsService.update(id, { owner_id }))
        );
        set(s => ({
            cards: s.cards.map(c => {
                const match = assignments.find(a => a.id === c.id);
                return match ? { ...c, owner_id: match.owner_id } : c;
            }),
        }));
    },

    // ── Task Actions ─────────────────────────────────────────────

    addTask: async (task) => {
        const created = await tasksService.insert(task);
        set(s => ({ tasks: [created, ...s.tasks] }));
        return created;
    },

    updateTask: async (id, updates) => {
        const updated = await tasksService.update(id, updates);
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
    },

    removeTask: async (id) => {
        await tasksService.remove(id);
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
    },

    toggleTaskDone: async (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        const updated = await tasksService.update(id, { is_done: !task.is_done });
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? updated : t) }));
    },

    // ── Message Actions ───────────────────────────────────────────

    sendMessage: async (message) => {
        const created = await messagesService.insert(message);
        set(s => ({ messages: [created, ...s.messages] }));
    },

    updateMessageStatus: async (id, status) => {
        await messagesService.updateStatus(id, status);
        set(s => ({
            messages: s.messages.map(m => m.id === id ? { ...m, status } : m),
        }));
    },

    removeMessage: async (id) => {
        await messagesService.remove(id);
        set(s => ({ messages: s.messages.filter(m => m.id !== id) }));
    },
}));
```

**Step 2: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: errors in screens that use old types — those are fixed in later tasks.

**Step 3: Commit**

```bash
git add tandem-mobile/src/store/slices/dataStore.ts
git commit -m "feat: rewrite dataStore with Supabase services"
```

---

## Task 7: Wire up loadAll + Realtime in AppProviders

Data needs to load once the household ID is known. Add a `DataInitializer` component that watches `householdId` from `authStore`.

**Files:**
- Create: `tandem-mobile/src/app/providers/DataInitializer.tsx`
- Modify: `tandem-mobile/src/app/providers/AppProviders.tsx`

**Step 1: Create DataInitializer**

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@store';
import { useDataStore } from '@store';

export const DataInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const householdId = useAuthStore(s => s.householdId);
    const { loadAll, subscribeToRealtime } = useDataStore();

    useEffect(() => {
        if (!householdId) return;
        loadAll(householdId);
        const unsubscribe = subscribeToRealtime(householdId);
        return unsubscribe;
    }, [householdId, loadAll, subscribeToRealtime]);

    return <>{children}</>;
};
```

**Step 2: Read AppProviders.tsx to see its current structure**

```bash
cat tandem-mobile/src/app/providers/AppProviders.tsx
```

**Step 3: Wrap children with DataInitializer inside AppProviders**

Add `DataInitializer` inside `AuthInitializer` (auth must be resolved before data loads):

```tsx
<AuthInitializer>
    <DataInitializer>
        {children}
    </DataInitializer>
</AuthInitializer>
```

**Step 4: Handle householdId loading inside AuthInitializer**

In `tandem-mobile/src/app/providers/AuthInitializer.tsx`, after `setUser` is called, query the user's household and call `setHouseholdId`. Add this inside the `onAuthStateChange` handler, after `setUser(toUser(session.user))`:

```typescript
import { useAuthStore } from '@store';
// inside the handler, after setUser:
// Use .maybeSingle() (not .single()) — .single() throws PGRST116 when 0 rows are found,
// which breaks new users who haven't yet joined a household.
const { data } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', session.user.id)
    .limit(1)
    .maybeSingle();
const { setHouseholdId } = useAuthStore.getState();
setHouseholdId(data?.household_id ?? null);
```

Note: call `useAuthStore.getState()` (not the hook) since this runs inside a callback, not a component.

Note on idempotency: `subscribeToRealtime` creates a new Supabase channel each time it is called. The `useEffect` cleanup (`return unsubscribe`) in `DataInitializer` correctly tears down the old channel before creating a new one whenever `householdId` changes. Do not call `subscribeToRealtime` directly outside of `DataInitializer` — doing so without cleanup would create duplicate channels.

**Step 5: Verify no TypeScript errors**

```bash
cd tandem-mobile && npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add tandem-mobile/src/app/providers/DataInitializer.tsx tandem-mobile/src/app/providers/AppProviders.tsx tandem-mobile/src/app/providers/AuthInitializer.tsx
git commit -m "feat: add DataInitializer, load household data on auth"
```

---

## Task 8: Update useCurrentUser

Replace hardcoded `Person` string logic with real data from the store.

**Files:**
- Modify: `tandem-mobile/src/shared/hooks/useCurrentUser.ts`

**Step 1: Rewrite the hook**

```typescript
import { useAuthStore } from '@store';
import { useDataStore } from '@store';

export const useCurrentUser = () => {
    const user = useAuthStore(s => s.user);
    const householdMembers = useDataStore(s => s.householdMembers);

    const currentMember = householdMembers.find(m => m.user_id === user?.id);
    const partnerMembers = householdMembers.filter(m => m.user_id !== user?.id);
    // For 2-person households partner is the single other member.
    // For larger households this returns the first non-self member.
    const partner = partnerMembers[0] ?? null;

    return {
        userId: user?.id ?? '',
        displayName: user?.name ?? '',
        currentMember,
        partner,
        householdMembers,
        initial: (user?.name ?? 'U').charAt(0),
        partnerInitial: (partner?.profile.display_name ?? '?').charAt(0),
    };
};
```

**Step 2: Verify TypeScript errors (expected — screens still use old shape)**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep useCurrentUser
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/shared/hooks/useCurrentUser.ts
git commit -m "feat: rewrite useCurrentUser with real household data"
```

---

## Task 9: Update navigation types

**Files:**
- Modify: `tandem-mobile/src/app/navigation/types.ts`

**Step 1: Change `CardDetail` param**

```typescript
// Before:
CardDetail: { cardName: string };
// After:
CardDetail: { cardId: string };
```

**Step 2: Commit**

```bash
git add tandem-mobile/src/app/navigation/types.ts
git commit -m "feat: update CardDetail navigation param to cardId"
```

---

## Task 10: Update CardsScreen + useCardsFiltering

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts`
- Modify: `tandem-mobile/src/features/cards/screens/CardsScreen.tsx`

**Step 1: Rewrite useCardsFiltering**

Key changes: compare `c.owner_id === userId` and `t.card_id === cardId` instead of name/Person comparisons.

```typescript
import { useMemo } from 'react';
import { type Card, type Task } from '@lib/types';
import { isDateInTimeFrame, type TaskTimeFilter } from '@shared/utils/date';

export type CardsFilter = 'all' | 'me';

interface UseCardsFilteringProps {
    cards: Card[];
    tasks: Task[];
    filter: CardsFilter;
    taskTimeFilter: TaskTimeFilter;
    hideEmptyCards: boolean;
    hideCompleted: boolean;
    hideUndated: boolean;
    userId: string;   // auth UUID of the current user
}

export const useCardsFiltering = ({
    cards, tasks, filter, taskTimeFilter,
    hideEmptyCards, hideCompleted, hideUndated, userId,
}: UseCardsFilteringProps) => {
    const filteredCards = useMemo(() => {
        return cards.filter((c: Card) => {
            const matchesOwnership = filter === 'all' ? true : c.owner_id === userId;
            if (!matchesOwnership) return false;
            if (hideEmptyCards) {
                const hasTasks = tasks.some((t: Task) =>
                    t.card_id === c.id &&
                    isDateInTimeFrame(t.due_date, taskTimeFilter, hideUndated) &&
                    (!hideCompleted || !t.is_done)
                );
                return hasTasks;
            }
            return true;
        });
    }, [cards, tasks, filter, taskTimeFilter, hideEmptyCards, hideCompleted, hideUndated, userId]);

    const getCardTasks = (cardId: string) => {
        return tasks.filter((t: Task) =>
            t.card_id === cardId &&
            isDateInTimeFrame(t.due_date, taskTimeFilter, hideUndated) &&
            t.owner_id === userId &&
            (!hideCompleted || !t.is_done)
        );
    };

    return { filteredCards, getCardTasks };
};
```

**Step 2: Update CardsScreen**

- Import `userId` from `useCurrentUser()` instead of `currentUser`
- Pass `userId` to `useCardsFiltering`
- Navigate with `cardId: card.id` instead of `cardName: card.name`
- Pass `card.id` to `CardListItem` and selection logic (replace `card.name` with `card.id`)
- Update `handleSelectiveShuffle`: `cards.filter(c => selectedCardIds.includes(c.id))`
- Update `reassignCards` call: pass `{ id: card.id, owner_id: newOwnerId }` shape

Key line changes in `CardsScreen.tsx`:
```typescript
// Before:
const { currentUser, partner, householdMembers } = useCurrentUser();
// After:
const { userId, householdMembers } = useCurrentUser();

// Before:
onPress={() => navigation.navigate('CardDetail', { cardName: card.name })}
// After:
onPress={() => navigation.navigate('CardDetail', { cardId: card.id })}

// Before:
const [selectedCardNames, setSelectedCardNames] = useState<string[]>([]);
// After:
const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
```

**Step 3: Verify**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep -E "(CardsScreen|useCardsFiltering)"
```

**Step 4: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts tandem-mobile/src/features/cards/screens/CardsScreen.tsx
git commit -m "feat: update CardsScreen and useCardsFiltering for new data model"
```

---

## Task 11: Update CardDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

**Step 1: Update the screen**

Key changes:
- `route.params.cardName` → `route.params.cardId`
- `cards.find(c => c.name === cardName)` → `cards.find(c => c.id === cardId)`
- `isOwner`: `card.owner === currentUser` → `card.owner_id === userId`
- `handleRename`: call `renameCard(card.id, newName)` — no longer needs old name
- `handleArchive`: call `archiveCard(card.id)` instead of `removeCard(card.name)`
- `updateCard`: call `updateCard(card.id, { note: editNote })`
- Task filtering: `tasks.filter(t => t.card === cardName)` → `tasks.filter(t => t.card_id === cardId)`
- `initialCard` prop to `AddTaskSheet`: pass `card.id` instead of `card.name`
- Show `{card.owner_id === userId ? 'You' : partner?.profile.display_name}` instead of `{card.owner}`

```typescript
// Key snippet — find card:
const card = useMemo(
    () => cards.find(c => c.id === cardId),
    [cards, cardId],
);

// Key snippet — filter tasks:
const cardTasks = useMemo(
    () => tasks.filter(t => t.card_id === cardId),
    [tasks, cardId],
);

// Key snippet — ownership:
const isOwner = card.owner_id === userId;
```

**Step 2: Verify**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep CardDetailScreen
```

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "feat: update CardDetailScreen for new data model"
```

---

## Task 12: Update CardListItem + OwnerBadge

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/CardListItem.tsx`
- Modify: `tandem-mobile/src/features/cards/components/OwnerBadge.tsx` (if it exists — check first)

**Step 1: Read both files first**

```bash
cat tandem-mobile/src/features/cards/components/CardListItem.tsx
cat tandem-mobile/src/features/cards/components/OwnerBadge.tsx
```

**Step 2: Update CardListItem**

- `card.owner` → `card.owner_id` (compare to userId, display member's display_name)
- Task filtering: `t.card === card.name` → `t.card_id === card.id`
- `<OwnerBadge name={card.owner} />` → resolve the display name first:

```typescript
const ownerName = householdMembers.find(m => m.user_id === card.owner_id)?.profile.display_name ?? '?';
// then:
<OwnerBadge name={ownerName} />
```

`CardListItem` will need to receive `householdMembers` as a prop or call `useDataStore(s => s.householdMembers)` directly — choose whichever is already consistent with how the component gets its data.

**Step 3: Update OwnerBadge (if needed)**

`OwnerBadge` currently receives a display-name string (`name: string`). That interface should remain unchanged — `CardListItem` is responsible for resolving the UUID to a display name before passing it. If `OwnerBadge` currently receives a `Person` type or anything from `FakeDataStore`, update the prop to a plain `string`.

**Step 4: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep -E "(CardListItem|OwnerBadge)"
git add tandem-mobile/src/features/cards/components/CardListItem.tsx tandem-mobile/src/features/cards/components/OwnerBadge.tsx
git commit -m "feat: update CardListItem and OwnerBadge for new data model"
```

---

## Task 13: Update AddCardModal

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/AddCardModal.tsx`

**Step 1: Update the component**

- Remove `Person` import from FakeDataStore
- `selectedOwner` state: `string` (uuid) instead of `Person`
- `useCurrentUser()`: use `userId` and `partner?.user_id`
- `ownerOptions`: `[{ key: userId, label: displayName }, { key: partner.user_id, label: partner.profile.display_name }]`
- `addCard` call: `{ name, owner_id: selectedOwner, household_id: householdId, note, is_archived: false }`
- Get `householdId` from `useAuthStore(s => s.householdId)`

**Step 2: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep AddCardModal
git add tandem-mobile/src/features/cards/components/AddCardModal.tsx
git commit -m "feat: update AddCardModal for new data model"
```

---

## Task 14: Update AddTaskSheet

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/AddTaskSheet.tsx`

**Step 1: Update the component**

- Remove `Task` import from FakeDataStore; import from `@lib/types`
- `initialCard` prop: now a `cardId: string` (not card name)
- Add `sourceMessageId?: string | null` prop — callers (e.g. InboxScreen) pass the originating message's id so it can be stored on the task
- `cardOptions`: `cards.filter(c => c.owner_id === userId).map(c => ({ key: c.id, label: c.name }))`
- `handleAdd`: build task with `card_id`, `owner_id`, `household_id`, `due_date`, `is_done`, and `source_message_id: sourceMessageId ?? null`
- `addTask` is now async and returns `Promise<Task>` — `await addTask(task)` and call `onTaskAdded(task)` after

```typescript
interface AddTaskSheetProps {
    // ... existing props ...
    initialCard?: string;        // card id
    sourceMessageId?: string | null;  // NEW — set when converting an inbox message
    onTaskAdded?: (task: Task) => void;
    onClose: () => void;
}

const { userId } = useCurrentUser();
const householdId = useAuthStore(s => s.householdId) ?? '';

const handleAdd = async () => {
    if (!taskName.trim()) return;
    const task = await addTask({
        name: taskName.trim(),
        card_id: taskCard || cards[0]?.id || '',
        household_id: householdId,
        owner_id: userId,
        due_date: taskDueDate ? toDateStringLocal(taskDueDate) : null,
        is_done: false,
        note: taskNote.trim() || null,
        source_message_id: sourceMessageId ?? null,
    });
    onTaskAdded?.(task);
    onClose();
};
```

**Step 2: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep AddTaskSheet
git add tandem-mobile/src/shared/components/ui/AddTaskSheet.tsx
git commit -m "feat: update AddTaskSheet for new data model"
```

---

## Task 15: Update TaskDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

**Step 1: Update the screen**

Key changes:
- `task.isDone` → `task.is_done`
- `task.dueDate` → `task.due_date`
- `task.card` (name string) → `task.card_id` (id)
- `task.owner === currentUser` → `task.owner_id === userId`
- `cardOptions`: filter by `c.owner_id === userId`, use `c.id` as key
- `updateTask` call: `{ name, card_id: editCardId, due_date, note }` — card_id changes trigger the `sync_task_card_owner` DB trigger automatically
- `editCard` state: store card id, not card name — make sure the `useState` initialization uses `task?.card_id`:

```typescript
// Before:
const [editCard, setEditCard] = useState(task?.card || '');
// After:
const [editCard, setEditCard] = useState(task?.card_id || '');
```

**Step 2: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep TaskDetailScreen
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "feat: update TaskDetailScreen for new data model"
```

---

## Task 16: Update InboxScreen

**Files:**
- Modify: `tandem-mobile/src/features/inbox/screens/InboxScreen.tsx`

**Step 1: Update the screen**

Key changes:
- `dropZoneItems` → `messages`
- `addDropZoneItem` → `sendMessage`
- `updateDropZoneItemStatus` → `updateMessageStatus`
- `removeDropZoneItem` → `removeMessage`
- `DropZoneItem` type → `Message` type
- `item.sender === currentUser` → `item.sender_id === userId`
- `item.receiver === currentUser` → `item.receiver_id === userId`
- `sender: currentUser, receiver: partner` → `sender_id: userId, receiver_id: partner.user_id`
- `item.createdAt` → `item.created_at`
- Filter received: `item.receiver_id === userId && item.status === 'pending'`
- Filter sent: `item.sender_id === userId`
- Display sender name: look up in `householdMembers` by `sender_id`

**Step 2: Fix message status on conversion — use `'converted'`, not `'archived'`**

The DB `check` constraint on `messages.status` enforces the lifecycle: `pending → converted | dismissed | archived`. When a message is turned into a task it must use `'converted'`. The current code erroneously uses `'archived'` — fix this:

```typescript
// Before (bug):
onTaskAdded={() => taskFromItem && updateDropZoneItemStatus(taskFromItem.id, 'archived')}

// After:
onTaskAdded={(task) => {
    if (taskFromItem) updateMessageStatus(taskFromItem.id, 'converted');
}}
```

**Step 3: Set `source_message_id` when converting a message to a task**

Pass `sourceMessageId` to `AddTaskSheet` so the new task is linked back to the originating message. `addTask` (Task 14) now passes `source_message_id` through automatically when this prop is set.

```typescript
<AddTaskSheet
    // ... existing props ...
    sourceMessageId={taskFromItem?.id ?? null}
    onTaskAdded={(task) => {
        if (taskFromItem) updateMessageStatus(taskFromItem.id, 'converted');
    }}
/>
```

**Step 4: Verify `formatRelativeTime` accepts ISO string**

`item.created_at` is an ISO timestamp string from Postgres (was previously a `Date` object in `DropZoneItem.createdAt`). Before migrating this call site:

```bash
cat tandem-mobile/src/shared/utils/date.ts | grep -A 10 "formatRelativeTime"
```

If `formatRelativeTime` only accepts `Date`, wrap the value: `new Date(item.created_at)`. If it already accepts `string | Date`, no change needed.

**Step 5: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep InboxScreen
git add tandem-mobile/src/features/inbox/screens/InboxScreen.tsx
git commit -m "feat: update InboxScreen for new data model"
```

---

## Task 17: Update remaining components (SwipeModeScreen, BalanceMeter, TasksScreen)

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx`
- Modify: `tandem-mobile/src/features/cards/components/BalanceMeter.tsx`
- Modify: `tandem-mobile/src/features/tasks/screens/TasksScreen.tsx`

**Step 1: Read each file**

```bash
cat tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx
cat tandem-mobile/src/features/cards/components/BalanceMeter.tsx
cat tandem-mobile/src/features/tasks/screens/TasksScreen.tsx
```

**Step 2: SwipeModeScreen**

- `members` prop: currently `Person[]` → change to `HouseholdMember[]`
- `assignCard`: takes `(card: Card, member: HouseholdMember)` → passes `member.user_id` as `owner_id`
- Display member names via `member.profile.display_name`

**Step 3: BalanceMeter**

Read the file first to see the current props shape, then update:

- Currently counts cards per `Person` string (e.g. `currentUser: string, partner: string`)
- Replace the two string props with `HouseholdMember` objects so the component can access both `user_id` (for counting) and `display_name` (for display)

New props shape:
```typescript
interface BalanceMeterProps {
    members: HouseholdMember[];  // all household members, in display order
    cards: Card[];               // all active cards (used to count per member)
}
```

Count per member: `cards.filter(c => c.owner_id === member.user_id).length`

Display: `member.profile.display_name`

Update the caller (`CardsScreen`) to pass `members={householdMembers}` and `cards={cards}`.

**Step 4: TasksScreen**

- `task.isDone` → `task.is_done`
- `task.dueDate` → `task.due_date`
- `task.owner === currentUser` → `task.owner_id === userId`
- `toggleTaskDone` is now async

**Step 5: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit
git add tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx tandem-mobile/src/features/cards/components/BalanceMeter.tsx tandem-mobile/src/features/tasks/screens/TasksScreen.tsx
git commit -m "feat: update SwipeModeScreen, BalanceMeter, TasksScreen for new data model"
```

---

## Task 18: Rewrite useCardShuffle

`useCardShuffle.ts` uses `Person` from FakeDataStore, calls `reassignCards` with the old `{ name: string; owner: Person }` shape, and calls `resetToDefaults` which does not exist in the new store. It will fail TypeScript after Task 6 and must be updated before the FakeDataStore can be deleted.

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardShuffle.ts`

**Step 1: Read the file**

```bash
cat tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
```

**Step 2: Update internal state and types**

- Remove all `Person` imports and FakeDataStore imports
- Internal card assignment state: `Array<{ id: string; owner_id: string }>` (was `Array<{ name: string; owner: Person }>`)
- `reassignCards` prop/callback: `(assignments: Array<{ id: string; owner_id: string }>) => void`
- Track cards by `card.id` throughout (not `card.name`)

**Step 3: Remove `handleFreshStart` / `resetToDefaults`**

`handleFreshStart` was a fake-data concept that called `resetToDefaults` to restore seed data. There is no real-data equivalent. Remove `handleFreshStart` entirely from the hook and any UI that calls it. If a "start fresh" feature is needed in the future it should be a Supabase RPC — leave a `// TODO` comment if the UI exposes a "Fresh Start" button that needs to be hidden or removed.

**Step 4: Update `finishShuffle`**

```typescript
// Before:
reassignCards(updatedCards.map(c => ({ name: c.name, owner: c.owner })));

// After:
reassignCards(updatedCards.map(c => ({ id: c.id, owner_id: c.owner_id })));
```

**Step 5: Verify + commit**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1 | grep useCardShuffle
git add tandem-mobile/src/features/cards/hooks/useCardShuffle.ts
git commit -m "feat: rewrite useCardShuffle for new data model"
```

---

## Task 19: Full TypeScript check + clean up FakeDataStore

**Files:**
- Delete: `tandem-mobile/src/shared/data/FakeDataStore.ts`
- Modify: any remaining files that import from `@shared/data/FakeDataStore`

**Step 1: Run full TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit 2>&1
```

Fix any remaining errors before proceeding.

**Step 2: Search for any remaining FakeDataStore imports**

```bash
grep -r "FakeDataStore" tandem-mobile/src --include="*.ts" --include="*.tsx"
```

Update each file found — replace with imports from `@lib/types`.

**Step 3: Delete FakeDataStore**

```bash
rm tandem-mobile/src/shared/data/FakeDataStore.ts
```

**Step 4: Run TypeScript check again — must be clean**

```bash
cd tandem-mobile && npx tsc --noEmit
```

Expected: 0 errors.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: remove FakeDataStore, complete Supabase data migration"
```

---

## Task 20: Schema security hardening — RPC `set search_path`

`security definer` functions are vulnerable to `search_path` injection if an attacker can create schemas. Supabase best practice is to add `set search_path = public` to every `security definer` function. The `handle_new_user` trigger already does this correctly; the three RPC functions do not.

**Files:**
- Modify: `supabase/schema.sql` (or the relevant migration file if functions are managed separately)

**Step 1: Add `set search_path = public` to each RPC function**

Find these three functions and add the `set search_path` option:

```sql
-- create_household
CREATE OR REPLACE FUNCTION public.create_household(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public   -- ADD THIS LINE
AS $$
...
$$;

-- join_household
CREATE OR REPLACE FUNCTION public.join_household(...)
...
SECURITY DEFINER
SET search_path = public   -- ADD THIS LINE
...

-- regenerate_invite_code
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(...)
...
SECURITY DEFINER
SET search_path = public   -- ADD THIS LINE
...
```

**Step 2: Apply to Supabase**

```bash
# If using Supabase CLI migrations:
supabase db push

# Or run the updated function definitions directly in the Supabase SQL editor.
```

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "security: add set search_path to security definer RPC functions"
```

---

## Post-migration smoke test checklist

Run the app and verify manually:

- [ ] Sign up creates a new user + profile row in Supabase
- [ ] Sign in restores session on re-launch (SecureStore persistence)
- [ ] Cards load from Supabase after sign in (once household exists)
- [ ] Adding a card inserts into Supabase and appears immediately
- [ ] Archiving a card removes it from the list (sets `is_archived = true`)
- [ ] Renaming a card updates the DB without touching tasks
- [ ] Adding a task creates it under the correct card
- [ ] Toggling a task done updates `is_done` in DB
- [ ] Reassigning cards via shuffle updates `owner_id` on cards (tasks cascade via DB trigger)
- [ ] Sending a message creates a `messages` row
- [ ] Converting a message to a task sets `source_message_id` on the new task and marks the message status as `'converted'` (not `'archived'`)
- [ ] Dismissing a message marks it as `'dismissed'`
- [ ] Realtime: change a record in Supabase dashboard — it updates in the app within seconds
- [ ] Error state: disconnect network mid-load — app shows error state rather than spinning indefinitely
