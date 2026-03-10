// ─── Domain Types ────────────────────────────────────────────

export type Person = string;

export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    note?: string;
    archived?: boolean;
    archivedAt?: string; // ISO date string, set when card is archived
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
    cards: Card[] = [];

    // ── Tasks ──────────────────────────────────────────────
    tasks: Task[] = [];

    // ── Drop Zone Items ─────────────────────────────────────
    dropZoneItems: DropZoneItem[] = [];

}

// Singleton instance — shared across all screens
export const fakeData = new FakeDataStore();
