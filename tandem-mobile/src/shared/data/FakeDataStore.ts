// ─── Domain Types ────────────────────────────────────────────

export type Person = 'Savannah' | 'Kevin';

export interface Card {
    name: string;
    owner: Person;
    note?: string;
}

export interface Task {
    id: string;
    name: string;
    card: string;
    owner: Person;
    dueDate: string;
    isDone: boolean;
    note?: string;
}

export type DropZoneItemStatus = 'pending' | 'converted' | 'dismissed' | 'archived';

export interface DropZoneItem {
    id: string;
    sender: Person;
    receiver: Person;
    content: string;
    status: DropZoneItemStatus;
    createdAt: Date;
}


// ─── Fake Data Store ─────────────────────────────────────────

class FakeDataStore {
    // ── Cards ──────────────────────────────────────────────
    cards: Card[] = [
        { name: 'Daily Tidying', owner: 'Savannah' },
        { name: 'Laundry', owner: 'Savannah' },
        { name: 'Meal Planning', owner: 'Savannah' },
        { name: 'Grocery Shopping', owner: 'Savannah' },
        { name: 'Morning Routine', owner: 'Savannah' },
        { name: 'School Communication', owner: 'Savannah' },
        { name: 'Dishes & Kitchen Cleanup', owner: 'Kevin' },
        { name: 'Deep Cleaning', owner: 'Kevin' },
        { name: 'Trash & Recycling', owner: 'Kevin' },
        { name: 'Yard Work', owner: 'Kevin' },
        { name: 'Car Care', owner: 'Kevin' },
        { name: 'Dinner', owner: 'Kevin' },
        { name: 'Bedtime Routine', owner: 'Kevin' },
        { name: 'Kid Activities', owner: 'Kevin' },
    ];

    // ── Tasks ──────────────────────────────────────────────
    tasks: Task[] = [
        { id: 't1', name: 'Wipe counters', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't2', name: 'Put away items', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't3', name: 'Quick vacuum', card: 'Daily Tidying', owner: 'Savannah', dueDate: '2026-02-24', isDone: false },
        { id: 't4', name: 'Wash clothes', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-23', isDone: true },
        { id: 't5', name: 'Dry clothes', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't6', name: 'Fold and put away', card: 'Laundry', owner: 'Savannah', dueDate: '2026-02-24', isDone: false },
        { id: 't7', name: 'Plan weekly menu', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-25', isDone: false },
        { id: 't8', name: 'Make grocery list', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-25', isDone: false },
        { id: 't9', name: 'Check pantry', card: 'Meal Planning', owner: 'Savannah', dueDate: '2026-02-25', isDone: true },
        { id: 't10', name: 'Review list', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't11', name: 'Shop for groceries', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't12', name: 'Put away groceries', card: 'Grocery Shopping', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't13', name: 'Wake kids', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-23', isDone: true },
        { id: 't14', name: 'Make breakfast', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-23', isDone: true },
        { id: 't15', name: 'Pack lunches', card: 'Morning Routine', owner: 'Savannah', dueDate: '2026-02-23', isDone: false },
        { id: 't16', name: 'Check emails', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-23', isDone: true },
        { id: 't17', name: 'Sign forms', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-24', isDone: false },
        { id: 't18', name: 'Update calendar', card: 'School Communication', owner: 'Savannah', dueDate: '2026-02-24', isDone: false },
        { id: 't19', name: 'Load dishwasher', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't20', name: 'Wipe counters', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't21', name: 'Take out trash', card: 'Dishes & Kitchen Cleanup', owner: 'Kevin', dueDate: '2026-02-23', isDone: true },
        { id: 't22', name: 'Vacuum all rooms', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't23', name: 'Mop floors', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't24', name: 'Clean bathrooms', card: 'Deep Cleaning', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't25', name: 'Take out trash', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't26', name: 'Sort recycling', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't27', name: 'Clean bins', card: 'Trash & Recycling', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't28', name: 'Mow lawn', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-25', isDone: false },
        { id: 't29', name: 'Trim hedges', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-25', isDone: false },
        { id: 't30', name: 'Water plants', card: 'Yard Work', owner: 'Kevin', dueDate: '2026-02-23', isDone: true },
        { id: 't31', name: 'Wash car', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', isDone: false },
        { id: 't32', name: 'Check oil', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', isDone: false },
        { id: 't33', name: 'Vacuum interior', card: 'Car Care', owner: 'Kevin', dueDate: '2026-03-01', isDone: false },
        { id: 't34', name: 'Cook dinner', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't35', name: 'Set table', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't36', name: 'Clean up', card: 'Dinner', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't37', name: 'Bath time', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't38', name: 'Read stories', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't39', name: 'Tuck in kids', card: 'Bedtime Routine', owner: 'Kevin', dueDate: '2026-02-23', isDone: false },
        { id: 't40', name: 'Drive to activities', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't41', name: 'Watch practice', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
        { id: 't42', name: 'Pick up kids', card: 'Kid Activities', owner: 'Kevin', dueDate: '2026-02-24', isDone: false },
    ];

    // ── Drop Zone Items ─────────────────────────────────────
    dropZoneItems: DropZoneItem[] = [
        {
            id: 'd1',
            sender: 'Kevin',
            receiver: 'Savannah',
            content: 'Pick up some oat milk if you have a chance!',
            status: 'pending',
            createdAt: new Date(),
        },
        {
            id: 'd2',
            sender: 'Savannah',
            receiver: 'Kevin',
            content: 'Could we do tacos tonight?',
            status: 'pending',
            createdAt: new Date(),
        }
    ];

}

// Singleton instance — shared across all screens
export const fakeData = new FakeDataStore();
