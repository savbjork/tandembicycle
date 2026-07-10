// ─── Domain Types ────────────────────────────────────────────

export type Person = string;

export type DomainStrain = 'light' | 'manageable' | 'drowning';

// A Card is a domain of responsibility. `owner` is the domain's head;
// undefined means the domain is unclaimed.
export interface Card {
  dbId?: string;
  name: string;
  owner?: Person;
  note?: string;
  strain?: DomainStrain;
  strainAt?: string; // ISO timestamp of last strain self-rating
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

// NetItem lifecycle:
//   unrouted → pending → accepted | done | someday | declined
//   declined → pending (re-route)   someday → accepted | done
export type NetItemStatus = 'unrouted' | 'pending' | 'accepted' | 'done' | 'someday' | 'declined';

export interface NetItem {
  id: string;
  capturer: Person;
  content: string;
  domain?: string; // card name, set at routing
  status: NetItemStatus;
  declineReason?: string;
  createdAt: Date;
}

// ─── Fake Data Store ─────────────────────────────────────────

class FakeDataStore {
  cards: Card[] = [];
  tasks: Task[] = [];
  netItems: NetItem[] = [];
}

// Singleton instance — shared across all screens
export const fakeData = new FakeDataStore();
