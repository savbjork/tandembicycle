import type { DomainStrain } from '@shared/data/FakeDataStore';

// Strain is the accent's one job (see 2026-07-19-cobalt-tangerine-design.md):
// none/light = neutral, rising strain = rising tangerine. Never error red.
export const STRAIN_DOT_CLASS: Record<DomainStrain, string> = {
  light: 'bg-neutral-300',
  manageable: 'bg-cranberry-200',
  drowning: 'bg-cranberry-500',
};

// Filled selector pills need readable text: dark-on-light for the pale
// tangerine tint, white on the darker saturated fill (700 clears WCAG AA;
// 600 does not). Note the two 'light' shades differ on purpose: the dot
// needs a subtle gray, the pill needs depth for white text.
export const STRAIN_FILL_CLASS: Record<DomainStrain, { bg: string; text: string }> = {
  light: { bg: 'bg-neutral-500', text: 'text-white' },
  manageable: { bg: 'bg-cranberry-200', text: 'text-cranberry-800' },
  drowning: { bg: 'bg-cranberry-700', text: 'text-white' },
};
