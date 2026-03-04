import { create } from 'zustand';
import {
    fakeData,
    type Card,
    type Task,
    type Person,
    type DropZoneItem,
    type DropZoneItemStatus,
} from '@shared/data/FakeDataStore';

// ─── State Interface ─────────────────────────────────────────

interface DataState {
    cards: Card[];
    tasks: Task[];
    dropZoneItems: DropZoneItem[];

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

    // ── Drop Zone Actions ─────────────────────────────────
    addDropZoneItem: (item: DropZoneItem) => void;
    updateDropZoneItemStatus: (id: string, status: DropZoneItemStatus) => void;
    removeDropZoneItem: (id: string) => void;

    // ── Bulk / Shuffle Actions ────────────────────────────
    reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
    resetToDefaults: (cards: Card[], tasks: Task[]) => void;
}

// ─── Store ───────────────────────────────────────────────────

/**
 * Central data store for cards, tasks, and drop zone items.
 *
 * Replaces the pattern of mutating the FakeDataStore singleton directly
 * and duplicating arrays into local useState hooks in every screen.
 *
 * All screens should read from and write through this store instead.
 * The store keeps the FakeDataStore singleton in sync for any code that
 * still references it directly (e.g. navigators reading task counts).
 */
export const useDataStore = create<DataState>((set) => ({
    // Initialize from fake data
    cards: [...fakeData.cards],
    tasks: [...fakeData.tasks],
    dropZoneItems: [...fakeData.dropZoneItems],

    // ── Card Actions ──────────────────────────────────────────

    addCard: (card) =>
        set((state) => {
            const newCards = [...state.cards, card];
            fakeData.cards = newCards;
            return { cards: newCards };
        }),

    updateCard: (name, updates) =>
        set((state) => {
            const newCards = state.cards.map((c) =>
                c.name === name ? { ...c, ...updates } : c
            );
            fakeData.cards = newCards;
            return { cards: newCards };
        }),

    removeCard: (name) =>
        set((state) => {
            const newCards = state.cards.filter((c) => c.name !== name);
            fakeData.cards = newCards;
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
            return { cards: newCards, tasks: newTasks };
        }),

    // ── Task Actions ──────────────────────────────────────────

    addTask: (task) =>
        set((state) => {
            const newTasks = [task, ...state.tasks];
            fakeData.tasks = newTasks;
            return { tasks: newTasks };
        }),

    updateTask: (taskId, updates) =>
        set((state) => {
            const newTasks = state.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t
            );
            fakeData.tasks = newTasks;
            return { tasks: newTasks };
        }),

    removeTask: (taskId) =>
        set((state) => {
            const newTasks = state.tasks.filter((t) => t.id !== taskId);
            fakeData.tasks = newTasks;
            return { tasks: newTasks };
        }),

    toggleTaskDone: (taskId) =>
        set((state) => {
            const newTasks = state.tasks.map((t) =>
                t.id === taskId ? { ...t, isDone: !t.isDone } : t
            );
            fakeData.tasks = newTasks;
            return { tasks: newTasks };
        }),

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
                    // Also reassign all tasks under this card
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

    resetToDefaults: (cards, tasks) =>
        set(() => {
            fakeData.cards = [...cards];
            fakeData.tasks = [...tasks];
            return { cards: [...cards], tasks: [...tasks] };
        }),
}));
