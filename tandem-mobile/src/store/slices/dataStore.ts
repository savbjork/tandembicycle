import { create } from 'zustand';
import {
  fakeData,
  type Card,
  type Task,
  type Person,
  type NetItem,
  type NetItemStatus,
} from '@shared/data/FakeDataStore';
import { supabase } from '@lib/supabase';
import { canTransition } from '@features/net/logic/netItemLogic';

// ─── State Interface ─────────────────────────────────────────

interface DataState {
  cards: Card[];
  tasks: Task[];
  netItems: NetItem[];

  // ── Household Context ─────────────────────────────────
  householdId: string | null;
  userIdByName: Record<string, string>;
  nameByUserId: Record<string, string>;

  // ── Card Actions ──────────────────────────────────────
  addCard: (card: Card) => void;
  updateCard: (name: string, updates: Partial<Card>) => void;
  removeCard: (name: string) => void;
  setCards: (cards: Card[]) => void;
  renameCard: (oldName: string, newName: string) => void;

  // ── Task Actions ──────────────────────────────────────
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  toggleTaskDone: (taskId: string) => void;
  setTasks: (tasks: Task[]) => void;

  // ── Net Actions ───────────────────────────────────────
  addNetItem: (item: NetItem) => void;
  routeNetItem: (id: string, domainName: string) => void;
  triageNetItem: (id: string, outcome: 'accepted' | 'done' | 'someday') => void;
  declineNetItem: (id: string, reason: string) => void;
  removeNetItem: (id: string) => void;
  setNetItems: (items: NetItem[]) => void;

  // ── Bulk / Shuffle Actions ────────────────────────────
  reassignCards: (assignments: { name: string; owner: Person }[]) => void;
  resetToDefaults: (cards: Card[], tasks: Task[]) => void;

  // ── Household Context Setter ──────────────────────────
  setHouseholdContext: (
    householdId: string,
    userIdByName: Record<string, string>,
    nameByUserId: Record<string, string>
  ) => void;

  // ── Owner Rename ──────────────────────────────────────
  renameOwner: (oldName: string, newName: string) => void;
}

// ─── Store ───────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  // Initialize from fake data
  cards: [...fakeData.cards],
  tasks: [...fakeData.tasks],
  netItems: [...fakeData.netItems],

  householdId: null,
  userIdByName: {},
  nameByUserId: {},

  // ── Household Context ─────────────────────────────────────

  setHouseholdContext: (householdId, userIdByName, nameByUserId) =>
    set({ householdId, userIdByName, nameByUserId }),

  // ── Card Actions ──────────────────────────────────────────

  addCard: (card) => {
    // Optimistic local update
    set((state) => {
      const newCards = [...state.cards, card];
      fakeData.cards = newCards;
      return { cards: newCards };
    });

    // Persist to Supabase
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
      .select('id')
      .single()
      .then(({ data }) => {
        if (!data?.id) return;
        set((state) => {
          const newCards = state.cards.map((c) =>
            c.name === card.name && c.owner === card.owner && !c.dbId ? { ...c, dbId: data.id } : c
          );
          fakeData.cards = newCards;
          return { cards: newCards };
        });

        // Repair net items routed to this card before its id back-filled:
        // their DB rows have domain_id null (see routeNetItem).
        const { netItems, userIdByName } = get();
        const headId = card.owner ? (userIdByName[card.owner] ?? null) : null;
        netItems
          .filter((i) => i.domain === card.name && i.id.startsWith('msg-'))
          .forEach((i) => {
            supabase
              .from('messages')
              .update({ domain_id: data.id, receiver_id: headId })
              .eq('id', i.id);
          });
      });
  },

  updateCard: (name, updates) =>
    set((state) => {
      const newCards = state.cards.map((c) => (c.name === name ? { ...c, ...updates } : c));
      fakeData.cards = newCards;

      // Persist to Supabase
      const card = state.cards.find((c) => c.name === name);
      if (card?.dbId) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
        if (updates.strain !== undefined) {
          dbUpdates.strain = updates.strain ?? null;
          dbUpdates.strain_at = updates.strainAt ?? new Date().toISOString();
        }
        if (updates.owner !== undefined) {
          dbUpdates.owner_id = updates.owner ? (get().userIdByName[updates.owner] ?? null) : null;
        }
        if (Object.keys(dbUpdates).length > 0) {
          supabase.from('cards').update(dbUpdates).eq('id', card.dbId);
        }
      }

      return { cards: newCards };
    }),

  removeCard: (name) =>
    set((state) => {
      const card = state.cards.find((c) => c.name === name);
      const newCards = state.cards.filter((c) => c.name !== name);
      fakeData.cards = newCards;

      if (card?.dbId) {
        supabase.from('cards').delete().eq('id', card.dbId);
      }

      return { cards: newCards };
    }),

  setCards: (cards) =>
    set(() => {
      fakeData.cards = [...cards];
      return { cards: [...cards] };
    }),

  renameCard: (oldName, newName) =>
    set((state) => {
      const newCards = state.cards.map((c) => (c.name === oldName ? { ...c, name: newName } : c));
      const newTasks = state.tasks.map((t) => (t.card === oldName ? { ...t, card: newName } : t));
      fakeData.cards = newCards;
      fakeData.tasks = newTasks;

      const card = state.cards.find((c) => c.name === oldName);
      if (card?.dbId) {
        supabase.from('cards').update({ name: newName }).eq('id', card.dbId);
      }

      return { cards: newCards, tasks: newTasks };
    }),

  // ── Task Actions ──────────────────────────────────────────

  addTask: (task) => {
    // Optimistic local update
    set((state) => {
      const newTasks = [task, ...state.tasks];
      fakeData.tasks = newTasks;
      return { tasks: newTasks };
    });

    // Persist to Supabase
    const { householdId, userIdByName, cards } = get();
    const ownerId = userIdByName[task.owner];
    const cardDbId = cards.find((c) => c.name === task.card)?.dbId;
    if (!householdId || !ownerId || !cardDbId) return;

    supabase
      .from('tasks')
      .insert({
        household_id: householdId,
        card_id: cardDbId,
        name: task.name,
        owner_id: ownerId,
        due_date: task.dueDate || null,
        is_done: task.isDone,
        note: task.note ?? null,
      })
      .select('id')
      .single()
      .then(({ data }) => {
        if (!data?.id) return;
        // Replace temp id with real DB id
        set((state) => {
          const newTasks = state.tasks.map((t) => (t.id === task.id ? { ...t, id: data.id } : t));
          fakeData.tasks = newTasks;
          return { tasks: newTasks };
        });
      });
  },

  updateTask: (taskId, updates) =>
    set((state) => {
      const newTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t));
      fakeData.tasks = newTasks;

      if (taskId.startsWith('task-')) {
        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null;
        if (updates.isDone !== undefined) dbUpdates.is_done = updates.isDone;
        if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
        if (Object.keys(dbUpdates).length > 0) {
          supabase.from('tasks').update(dbUpdates).eq('id', taskId);
        }
      }

      return { tasks: newTasks };
    }),

  removeTask: (taskId) =>
    set((state) => {
      const newTasks = state.tasks.filter((t) => t.id !== taskId);
      fakeData.tasks = newTasks;

      if (taskId.startsWith('task-')) {
        supabase.from('tasks').delete().eq('id', taskId);
      }

      return { tasks: newTasks };
    }),

  toggleTaskDone: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newIsDone = !task.isDone;

    set((state) => {
      const newTasks = state.tasks.map((t) => (t.id === taskId ? { ...t, isDone: newIsDone } : t));
      fakeData.tasks = newTasks;
      return { tasks: newTasks };
    });

    if (taskId.startsWith('task-')) {
      supabase.from('tasks').update({ is_done: newIsDone }).eq('id', taskId);
    }
  },

  setTasks: (tasks) =>
    set(() => {
      fakeData.tasks = [...tasks];
      return { tasks: [...tasks] };
    }),

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

    // Invariant: while the DB id is back-filling, mutations against the temp id
    // (routeNetItem/triageNetItem/declineNetItem/removeNetItem) stay local-only.
    // Once the insert resolves, we replay the item's final local state against
    // the real DB id so those races aren't lost.
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
        let synced: NetItem | undefined;
        set((state) => {
          const newItems = state.netItems.map((i) => {
            if (i.id !== item.id) return i;
            synced = { ...i, id: data.id };
            return synced;
          });
          fakeData.netItems = newItems;
          return { netItems: newItems };
        });

        // Item was removed locally before the insert resolved — delete the DB row.
        if (!synced) {
          supabase.from('messages').delete().eq('id', data.id);
          return;
        }

        // Replay mutations that raced the id back-fill (their updates no-op'd on the temp id).
        const syncedItem = synced;
        if (syncedItem.status !== 'unrouted') {
          const { cards, userIdByName } = get();
          const card = syncedItem.domain
            ? cards.find((c) => c.name === syncedItem.domain)
            : undefined;
          supabase
            .from('messages')
            .update({
              status: syncedItem.status,
              domain_id: card?.dbId ?? null,
              receiver_id: card?.owner ? (userIdByName[card.owner] ?? null) : null,
              decline_reason: syncedItem.declineReason ?? null,
            })
            .eq('id', data.id);
        }
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

    const headId = userIdByName[card.owner] ?? null;
    if (id.startsWith('msg-')) {
      supabase
        .from('messages')
        .update({ domain_id: card.dbId ?? null, receiver_id: headId, status: 'pending' })
        .eq('id', id);
    }
  },

  triageNetItem: (id, outcome) => {
    const item = get().netItems.find((i) => i.id === id);
    if (!item || !canTransition(item.status, outcome)) return;

    set((state) => {
      const newItems = state.netItems.map((i) => (i.id === id ? { ...i, status: outcome } : i));
      fakeData.netItems = newItems;
      return { netItems: newItems };
    });

    if (id.startsWith('msg-')) {
      supabase.from('messages').update({ status: outcome }).eq('id', id);
    }
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

    if (id.startsWith('msg-')) {
      supabase.from('messages').update({ status: 'declined', decline_reason: reason }).eq('id', id);
    }
  },

  removeNetItem: (id) =>
    set((state) => {
      const newItems = state.netItems.filter((item) => item.id !== id);
      fakeData.netItems = newItems;

      if (id.startsWith('msg-')) {
        supabase.from('messages').delete().eq('id', id);
      }

      return { netItems: newItems };
    }),

  setNetItems: (items) =>
    set(() => {
      fakeData.netItems = [...items];
      return { netItems: [...items] };
    }),

  // ── Bulk / Shuffle Actions ────────────────────────────────

  reassignCards: (assignments) => {
    set((state) => {
      const newCards = [...state.cards];
      const newTasks = [...state.tasks];

      assignments.forEach(({ name, owner }) => {
        const card = newCards.find((c) => c.name === name);
        if (card) {
          card.owner = owner;
          newTasks.forEach((task) => {
            if (task.card === name) {
              task.owner = owner;
            }
          });
        }
      });

      fakeData.cards = newCards;
      fakeData.tasks = newTasks;
      return { cards: newCards, tasks: newTasks };
    });

    // Persist new heads
    const { userIdByName, cards: allCards } = get();
    assignments.forEach(({ name, owner }) => {
      const card = allCards.find((c) => c.name === name);
      const ownerId = userIdByName[owner];
      if (card?.dbId && ownerId) {
        supabase.from('cards').update({ owner_id: ownerId }).eq('id', card.dbId);
      }
    });
  },

  renameOwner: (oldName, newName) =>
    set((state) => {
      const newCards = state.cards.map((c) =>
        c.owner === oldName ? { ...c, owner: newName as Person } : c
      );
      const newTasks = state.tasks.map((t) =>
        t.owner === oldName ? { ...t, owner: newName as Person } : t
      );

      // Update the name ↔ id maps
      const userId = state.userIdByName[oldName];
      const newUserIdByName = { ...state.userIdByName };
      const newNameByUserId = { ...state.nameByUserId };
      if (userId) {
        delete newUserIdByName[oldName];
        newUserIdByName[newName] = userId;
        newNameByUserId[userId] = newName;
      }

      fakeData.cards = newCards;
      fakeData.tasks = newTasks;
      return {
        cards: newCards,
        tasks: newTasks,
        userIdByName: newUserIdByName,
        nameByUserId: newNameByUserId,
      };
    }),

  resetToDefaults: (cards, tasks) => {
    // Optimistic local update
    set(() => {
      fakeData.cards = [...cards];
      fakeData.tasks = [...tasks];
      return { cards: [...cards], tasks: [...tasks] };
    });

    // Persist to Supabase
    const { householdId, userIdByName } = get();
    if (!householdId) return;

    (async () => {
      // Wipe existing cards and tasks for this household
      await supabase.from('tasks').delete().eq('household_id', householdId);
      await supabase.from('cards').delete().eq('household_id', householdId);

      // Insert each new card and capture its DB id
      for (const card of cards) {
        const ownerId = card.owner ? userIdByName[card.owner] : null;

        const { data } = await supabase
          .from('cards')
          .insert({
            household_id: householdId,
            name: card.name,
            owner_id: ownerId,
            note: card.note ?? null,
          })
          .select('id')
          .single();

        if (data?.id) {
          set((state) => {
            const newCards = state.cards.map((c) =>
              c.name === card.name && c.owner === card.owner && !c.dbId
                ? { ...c, dbId: data.id }
                : c
            );
            fakeData.cards = newCards;
            return { cards: newCards };
          });
        }
      }
    })();
  },
}));
