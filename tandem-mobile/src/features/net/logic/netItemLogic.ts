import type { Card, NetItem, NetItemStatus, Person, Task } from '@shared/data/FakeDataStore';

// Legal lifecycle moves. Anything not listed is forbidden — items never
// silently die, and finished items never come back.
const TRANSITIONS: Record<NetItemStatus, NetItemStatus[]> = {
  unrouted: ['pending'],
  pending: ['accepted', 'done', 'someday', 'declined'],
  declined: ['pending'],
  someday: ['accepted', 'done'],
  accepted: [],
  done: [],
};

export const canTransition = (from: NetItemStatus, to: NetItemStatus): boolean =>
  TRANSITIONS[from].includes(to);

export const isHead = (card: Card, person: Person): boolean => card.owner === person;

export const selectUnrouted = (items: NetItem[], me: Person): NetItem[] =>
  items.filter((i) => i.capturer === me && i.status === 'unrouted');

export const selectTriage = (items: NetItem[], cards: Card[], me: Person): NetItem[] =>
  items.filter((i) => {
    if (i.status !== 'pending' || !i.domain) return false;
    const card = cards.find((c) => c.name === i.domain);
    return card !== undefined && isHead(card, me);
  });

export const selectReturned = (items: NetItem[], me: Person): NetItem[] =>
  items.filter((i) => i.capturer === me && i.status === 'declined');

export const selectSomedayForDomain = (items: NetItem[], domain: string): NetItem[] =>
  items.filter((i) => i.status === 'someday' && i.domain === domain);

export const selectVisibleTasks = (tasks: Task[], me: Person): Task[] =>
  tasks.filter((t) => t.owner === me);

const STRAIN_STALE_MS = 7 * 24 * 60 * 60 * 1000;

export const domainsNeedingStrainCheck = (cards: Card[], me: Person, now: Date): Card[] =>
  cards.filter((c) => {
    if (c.owner !== me) return false;
    if (!c.strainAt) return true;
    return now.getTime() - new Date(c.strainAt).getTime() > STRAIN_STALE_MS;
  });
