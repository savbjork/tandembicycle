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

// Every hue-bearing family, mapped to the ONE ramp it must draw from.
// surface/border/text/neutral/error are exempt neutrals.
const EXPECTED_RAMP: Record<string, string[]> = {
  primary: COBALT,
  secondary: COBALT,
  evergreen: COBALT,
  success: COBALT,
  info: COBALT,
  cranberry: TANGERINE,
  warning: TANGERINE,
};

describe('two-hue palette discipline', () => {
  for (const [family, ramp] of Object.entries(EXPECTED_RAMP)) {
    const rampName = ramp === COBALT ? 'cobalt' : 'tangerine';
    it(`${family} only uses ${rampName} values`, () => {
      const allowed = new Set(ramp.map((h) => h.toLowerCase()));
      const offenders = Object.entries(
        tokens[family as keyof typeof tokens]
      ).filter(([, hex]) => !allowed.has(String(hex).toLowerCase()));
      expect(offenders).toEqual([]);
    });
  }
});
