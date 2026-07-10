import { domainHue, HUE_FAMILIES, type HueFamily } from '../domainHue';

describe('domainHue', () => {
  it('is deterministic — same name always maps to the same family', () => {
    expect(domainHue('Groceries')).toBe(domainHue('Groceries'));
    expect(domainHue('Kids health')).toBe(domainHue('Kids health'));
  });

  it('always returns a member of the six families', () => {
    const names = ['Groceries', 'Kids health', 'Meals', 'Laundry', 'Pets', 'Car', 'Yard', ''];
    names.forEach((n) => {
      expect(HUE_FAMILIES).toContain(domainHue(n));
    });
  });

  it('spreads names across more than one family', () => {
    const names = ['Groceries', 'Kids health', 'Meals', 'Laundry', 'Pets', 'Car', 'Yard', 'Trash'];
    const distinct = new Set<HueFamily>(names.map(domainHue));
    expect(distinct.size).toBeGreaterThan(2);
  });
});
