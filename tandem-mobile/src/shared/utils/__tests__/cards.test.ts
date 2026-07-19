import { dedupeByName } from '../cards';

describe('dedupeByName', () => {
  it('keeps the first occurrence when a name appears twice', () => {
    const cards = [
      { name: 'Plan dates', owner: 'A', dbId: 'db-1' },
      { name: 'Dishes', owner: 'B', dbId: 'db-2' },
      { name: 'Plan dates', owner: 'B', dbId: 'db-3' },
    ];

    expect(dedupeByName(cards)).toEqual([
      { name: 'Plan dates', owner: 'A', dbId: 'db-1' },
      { name: 'Dishes', owner: 'B', dbId: 'db-2' },
    ]);
  });

  it('returns all items when names are unique', () => {
    const cards = [{ name: 'Dishes' }, { name: 'Laundry' }];
    expect(dedupeByName(cards)).toEqual(cards);
  });

  it('handles an empty list', () => {
    expect(dedupeByName([])).toEqual([]);
  });
});
