import type { Card, NetItem, Task } from '@shared/data/FakeDataStore';
import {
  canTransition,
  isHead,
  selectUnrouted,
  selectTriage,
  selectReturned,
  selectSomedayForDomain,
  selectVisibleTasks,
  domainsNeedingStrainCheck,
} from '../netItemLogic';

const cards: Card[] = [
  { name: 'Groceries', owner: 'Sam' },
  { name: 'Kids Health', owner: 'Alex' },
  { name: 'Yard', owner: undefined }, // unclaimed
];

const item = (over: Partial<NetItem>): NetItem => ({
  id: 'n1',
  capturer: 'Sam',
  content: 'kids need shoes',
  status: 'unrouted',
  createdAt: new Date('2026-07-01'),
  ...over,
});

describe('canTransition', () => {
  it('allows the legal lifecycle moves', () => {
    expect(canTransition('unrouted', 'pending')).toBe(true);
    expect(canTransition('pending', 'accepted')).toBe(true);
    expect(canTransition('pending', 'done')).toBe(true);
    expect(canTransition('pending', 'someday')).toBe(true);
    expect(canTransition('pending', 'declined')).toBe(true);
    expect(canTransition('declined', 'pending')).toBe(true);
    expect(canTransition('someday', 'accepted')).toBe(true);
    expect(canTransition('someday', 'done')).toBe(true);
  });
  it('rejects illegal moves', () => {
    expect(canTransition('unrouted', 'accepted')).toBe(false);
    expect(canTransition('accepted', 'pending')).toBe(false);
    expect(canTransition('done', 'pending')).toBe(false);
    expect(canTransition('unrouted', 'declined')).toBe(false);
  });
});

describe('isHead', () => {
  it('true only for the owner', () => {
    expect(isHead(cards[0], 'Sam')).toBe(true);
    expect(isHead(cards[0], 'Alex')).toBe(false);
  });
  it('false for unclaimed domains, whoever asks', () => {
    expect(isHead(cards[2], 'Sam')).toBe(false);
  });
});

describe('selectors — the visibility wall', () => {
  const items: NetItem[] = [
    item({ id: 'a', capturer: 'Sam', status: 'unrouted' }),
    item({ id: 'b', capturer: 'Sam', status: 'pending', domain: 'Kids Health' }),
    item({ id: 'c', capturer: 'Alex', status: 'pending', domain: 'Groceries' }),
    item({
      id: 'd',
      capturer: 'Sam',
      status: 'declined',
      domain: 'Kids Health',
      declineReason: 'camp is your call',
    }),
    item({ id: 'e', capturer: 'Alex', status: 'someday', domain: 'Groceries' }),
    item({ id: 'f', capturer: 'Alex', status: 'unrouted' }),
  ];

  it('selectUnrouted: only my own captures', () => {
    expect(selectUnrouted(items, 'Sam').map((i) => i.id)).toEqual(['a']);
  });

  it('selectTriage: only pending items in domains I head', () => {
    expect(selectTriage(items, cards, 'Sam').map((i) => i.id)).toEqual(['c']);
    expect(selectTriage(items, cards, 'Alex').map((i) => i.id)).toEqual(['b']);
  });

  it('selectReturned: only my declined captures', () => {
    expect(selectReturned(items, 'Sam').map((i) => i.id)).toEqual(['d']);
    expect(selectReturned(items, 'Alex')).toEqual([]);
  });

  it('selectSomedayForDomain: someday pile per domain', () => {
    expect(selectSomedayForDomain(items, 'Groceries').map((i) => i.id)).toEqual(['e']);
  });

  it('selectVisibleTasks: never returns a partner task', () => {
    const tasks: Task[] = [
      { id: 't1', name: 'buy milk', card: 'Groceries', owner: 'Sam', dueDate: '', isDone: false },
      { id: 't2', name: 'book dr', card: 'Kids Health', owner: 'Alex', dueDate: '', isDone: false },
    ];
    expect(selectVisibleTasks(tasks, 'Sam').map((t) => t.id)).toEqual(['t1']);
  });
});

describe('domainsNeedingStrainCheck', () => {
  const now = new Date('2026-07-04T12:00:00Z');
  it('flags my domains never rated or rated over 7 days ago', () => {
    const myCards: Card[] = [
      { name: 'A', owner: 'Sam' }, // never rated
      { name: 'B', owner: 'Sam', strain: 'light', strainAt: '2026-06-20T00:00:00Z' }, // stale
      { name: 'C', owner: 'Sam', strain: 'light', strainAt: '2026-07-02T00:00:00Z' }, // fresh
      { name: 'D', owner: 'Alex', strain: undefined }, // not mine
      { name: 'E', owner: undefined }, // unclaimed
    ];
    expect(domainsNeedingStrainCheck(myCards, 'Sam', now).map((c) => c.name)).toEqual(['A', 'B']);
  });
});
