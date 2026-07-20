import tokens from '../tokens';

// The two approved hue ramps from docs/plans/2026-07-19-cobalt-tangerine-design.md.
const COBALT = [
  '#EDF0FD', '#DDE3FA', '#B8C4F4', '#8FA0EC', '#5C74E6',
  '#2B4BE0', '#1F3AB8', '#182D8F', '#112066', '#0A1340',
];
const TANGERINE = [
  '#FFF3EB', '#FFE1D1', '#FFC7A3', '#FFA269', '#FF873F',
  '#FF6B2B', '#E25812', '#C24308', '#93330A', '#632205',
];
const ALLOWED = new Set([...COBALT, ...TANGERINE].map((h) => h.toLowerCase()));

// Every hue-bearing family. surface/border/text/neutral/error are exempt neutrals.
const HUE_FAMILIES = [
  'primary', 'secondary', 'cranberry', 'evergreen', 'success', 'warning', 'info',
] as const;

describe('two-hue palette discipline', () => {
  for (const family of HUE_FAMILIES) {
    it(`${family} only uses cobalt or tangerine values`, () => {
      const offenders = Object.entries(tokens[family]).filter(
        ([, hex]) => !ALLOWED.has(String(hex).toLowerCase())
      );
      expect(offenders).toEqual([]);
    });
  }
});
