import { create } from 'zustand';
import {
    fakeData,
    type Card,
    type Task,
    type Person,
    type DropZoneItem,
    type DropZoneItemStatus,
} from '@shared/data/FakeDataStore';
import { supabase } from '@lib/supabase';

// ─── State Interface ─────────────────────────────────────────

interface DataState {
    cards: Card[];
    tasks: Task[];
    dropZoneItems: DropZoneItem[];

    // ── Household Context ─────────────────────────────────
    householdId: string | null;
    userIdByName: Record<string, string>;
    nameByUserId: Record<string, string>;

    // ── Card Actions ──────────────────────────────────────
    addCard: (card: Card) => void;
    updateCard: (name: string, updates: Partial<Card>) => void;
    removeCard: (name: string) => void;
    archiveCard: (name: string) => void;
    unarchiveCard: (names: string[]) => void;
    setCards: (cards: Card[]) => void;
    renameCard: (oldName: string, newName: string) => void;

    // ── Task Actions ──────────────────────────────────────
    addTask: (task: Task) => void;
    updateTask: (taskId: string, updates: Partial<Task>) => void;
    removeTask: (taskId: string) => void;
    toggleTaskDone: (taskId: string) => void;
    setTasks: (tasks: Task[]) => void;

    // ── Drop Zone Actions ─────────────────────────────────
    addDropZoneItem: (item: DropZoneItem) => void;
    updateDropZoneItemStatus: (id: string, status: DropZoneItemStatus) => void;
    removeDropZoneItem: (id: string) => void;

    // ── Bulk / Shuffle Actions ────────────────────────────
    reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
    resetToDefaults: (cards: Card[], tasks: Task[]) => void;

    // ── Household Context Setter ──────────────────────────
    setHouseholdContext: (
        householdId: string,
        userIdByName: Record<string, string>,
        nameByUserId: Record<string, string>,
    ) => void;

    // ── Owner Rename ──────────────────────────────────────
    renameOwner: (oldName: string, newName: string) => void;
}

// ─── Store ───────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
    // Initialize from fake data
    cards: [...fakeData.cards],
    tasks: [...fakeData.tasks],
    dropZoneItems: [...fakeData.dropZoneItems],

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
        const ownerId = userIdByName[card.owner];
        if (!householdId || !ownerId) return;

        supabase
            .from('cards')
            .insert({ household_id: householdId, name: card.name, owner_id: ownerId, note: card.note ?? null })
            .select('id')
            .single()
            .then(({ data }) => {
                if (!data?.id) return;
                set((state) => {
                    const newCards = state.cards.map((c) =>
                        c.name === card.name && c.owner === card.owner && !c.dbId
                            ? { ...c, dbId: data.id }
                            : c,
                    );
                    fakeData.cards = newCards;
                    return { cards: newCards };
                });
            });
    },

    updateCard: (name, updates) =>
        set((state) => {
            const newCards = state.cards.map((c) =>
                c.name === name ? { ...c, ...updates } : c
            );
            fakeData.cards = newCards;

            // Persist to Supabase
            const card = state.cards.find((c) => c.name === name);
            if (card?.dbId) {
                const dbUpdates: Record<string, unknown> = {};
                if (updates.note !== undefined) dbUpdates.note = updates.note ?? null;
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

    setCards: (cards) =>
        set(() => {
            fakeData.cards = [...cards];
            return { cards: [...cards] };
        }),

    renameCard: (oldName, newName) =>
        set((state) => {
            const newCards = state.cards.map((c) =>
                c.name === oldName ? { ...c, name: newName } : c
            );
            const newTasks = state.tasks.map((t) =>
                t.card === oldName ? { ...t, card: newName } : t
            );
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
                    const newTasks = state.tasks.map((t) =>
                        t.id === task.id ? { ...t, id: data.id } : t,
                    );
                    fakeData.tasks = newTasks;
                    return { tasks: newTasks };
                });
            });
    },

    updateTask: (taskId, updates) =>
        set((state) => {
            const newTasks = state.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
            );
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
            const newTasks = state.tasks.map((t) =>
                t.id === taskId ? { ...t, isDone: newIsDone } : t
            );
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

    // ── Drop Zone Actions ─────────────────────────────────────

    addDropZoneItem: (item) =>
        set((state) => {
            const newItems = [item, ...state.dropZoneItems];
            fakeData.dropZoneItems = newItems;
            return { dropZoneItems: newItems };
        }),

    updateDropZoneItemStatus: (id, status) =>
        set((state) => {
            const newItems = state.dropZoneItems.map((item) =>
                item.id === id ? { ...item, status } : item
            );
            fakeData.dropZoneItems = newItems;
            return { dropZoneItems: newItems };
        }),

    removeDropZoneItem: (id) =>
        set((state) => {
            const newItems = state.dropZoneItems.filter((item) => item.id !== id);
            fakeData.dropZoneItems = newItems;
            return { dropZoneItems: newItems };
        }),

    // ── Bulk / Shuffle Actions ────────────────────────────────

    reassignCards: (assignments) =>
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
        }),

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
                const ownerId = userIdByName[card.owner];
                if (!ownerId) continue;

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
