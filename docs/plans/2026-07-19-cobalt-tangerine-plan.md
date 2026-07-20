# Cobalt & Tangerine Color Injection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Tandem's four-hue palette (teal/plum/cranberry/evergreen) with exactly two hues — cobalt (brand) and tangerine (accent) — leaving neutrals, error red, fonts, and layout untouched.

**Architecture:** All color values live in `tandem-mobile/src/shared/constants/tokens.js`, consumed by both `tailwind.config.js` (NativeWind classes) and `colors.ts` (JS `COLORS` object). The swap is a value remap under unchanged token names, plus one targeted component fix: the strain UI currently borrows `success`/`warning`/`error` classes and must move onto the tangerine ramp (spec forbids error doing strain duty). A jest guard test enforces the two-hue discipline permanently.

**Tech Stack:** React Native/Expo, NativeWind (Tailwind), jest. Spec: `docs/plans/2026-07-19-cobalt-tangerine-design.md`. Branch: `cobaltTangerine` (already exists, contains the spec).

**Working directory:** all commands run from `tandem-mobile/` unless noted.

---

### Task 1: Palette guard test (red)

**Files:**
- Test (create): `src/shared/constants/__tests__/tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/shared/constants/__tests__/tokens.test.ts`
Expected: FAIL — all 7 family tests fail (current values are teal/plum/etc.)

- [ ] **Step 3: Commit the red test**

```bash
git add src/shared/constants/__tests__/tokens.test.ts
git commit -m "test: guard that hue tokens only use cobalt or tangerine"
```

---

### Task 2: Remap tokens to cobalt & tangerine (green)

**Files:**
- Modify: `src/shared/constants/tokens.js` (whole file)
- Modify: `src/shared/constants/tokens.d.ts:12` (neutral gains a 300)

- [ ] **Step 1: Replace `tokens.js` with the remapped values**

Complete new file content:

```js
module.exports = {
  // Brand — Cobalt: buttons, nav, selection, links, focus (replaces teal)
  primary: {
    50: '#EDF0FD',
    100: '#DDE3FA',
    200: '#B8C4F4',
    300: '#8FA0EC',
    400: '#5C74E6',
    500: '#2B4BE0',
    600: '#1F3AB8',
    700: '#182D8F',
    800: '#112066',
    900: '#0A1340',
  },
  // People — consolidated into brand cobalt (replaces plum); the visual
  // pass may demote individual elements to neutral where the old
  // primary/secondary contrast carried meaning.
  secondary: {
    50: '#EDF0FD',
    100: '#DDE3FA',
    200: '#B8C4F4',
    300: '#8FA0EC',
    400: '#5C74E6',
    500: '#2B4BE0',
    600: '#1F3AB8',
    700: '#182D8F',
    800: '#112066',
    900: '#0A1340',
  },
  // Accent — Tangerine: strain, Net badge, celebration (replaces cranberry)
  cranberry: {
    50: '#FFF3EB',
    100: '#FFE1D1',
    200: '#FFC7A3',
    300: '#FFA269',
    400: '#FF873F',
    500: '#FF6B2B',
    600: '#E25812',
    700: '#C24308',
    800: '#93330A',
    900: '#632205',
  },
  // Task actions — consolidated into brand cobalt (replaces evergreen)
  evergreen: {
    50: '#EDF0FD',
    100: '#DDE3FA',
    200: '#B8C4F4',
    300: '#8FA0EC',
    400: '#5C74E6',
    500: '#2B4BE0',
    600: '#1F3AB8',
    700: '#182D8F',
    800: '#112066',
    900: '#0A1340',
  },
  // Validation errors / danger / destructive actions — functional
  // exception, deliberately NOT part of the two-hue brand palette.
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  surface: {
    DEFAULT: '#ffffff',
    muted: '#f9fafb',
    dim: '#fafafa',
    hover: '#f3f4f6',
  },
  border: {
    DEFAULT: '#e5e7eb',
    light: '#f0f0f0',
    muted: '#f3f4f6',
    strong: '#d1d5db',
  },
  text: {
    DEFAULT: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af',
    light: '#374151',
  },
  // Success is a brand moment, not a third hue
  success: {
    50: '#EDF0FD',
    100: '#DDE3FA',
    600: '#1F3AB8',
    700: '#182D8F',
  },
  // Warnings are attention signals — tangerine
  warning: {
    50: '#FFF3EB',
    100: '#FFE1D1',
    500: '#FF6B2B',
    600: '#E25812',
    700: '#C24308',
    800: '#93330A',
  },
  neutral: {
    300: '#d1d5db',
    500: '#6b7280',
  },
  info: {
    100: '#DDE3FA',
    700: '#182D8F',
  },
};
```

- [ ] **Step 2: Update `tokens.d.ts` for the new neutral shape**

Change line 12 from:

```ts
  neutral: { 500: string };
```

to:

```ts
  neutral: { 300: string; 500: string };
```

- [ ] **Step 3: Run the guard test — must pass now**

Run: `npx jest src/shared/constants/__tests__/tokens.test.ts`
Expected: PASS (7/7)

- [ ] **Step 4: Full check — jest, tsc**

Run: `npx jest && npx tsc --noEmit`
Expected: all suites pass; tsc silent

- [ ] **Step 5: Commit**

```bash
git add src/shared/constants/tokens.js src/shared/constants/tokens.d.ts
git commit -m "feat: remap hue tokens to cobalt brand and tangerine accent"
```

---

### Task 3: Strain UI onto the tangerine ramp

The strain signal must stop using `success`/`warning`/`error` (spec: error is destructive-only; strain is the accent's job). Two components duplicate the same class map — consolidate into one module. Markup does not change; only classes do.

**Files:**
- Create: `src/features/cards/components/strainColors.ts`
- Modify: `src/features/cards/components/CardListItem.tsx:1-13`
- Modify: `src/features/cards/components/StrainSelector.tsx:11-15` and `:27-37`
- Modify: `tailwind.config.js:6-23` (safelist)

- [ ] **Step 1: Create the shared strain color module**

`src/features/cards/components/strainColors.ts`:

```ts
import type { DomainStrain } from '@shared/data/FakeDataStore';

// Strain is the accent's one job (see 2026-07-19-cobalt-tangerine-design.md):
// none/light = neutral, rising strain = rising tangerine. Never error red.
export const STRAIN_DOT_CLASS: Record<DomainStrain, string> = {
  light: 'bg-neutral-300',
  manageable: 'bg-cranberry-200',
  drowning: 'bg-cranberry-500',
};

// Filled selector pills need readable text: dark-on-light for the pale
// tangerine tint, white on the saturated fills.
export const STRAIN_FILL_CLASS: Record<DomainStrain, { bg: string; text: string }> = {
  light: { bg: 'bg-neutral-500', text: 'text-white' },
  manageable: { bg: 'bg-cranberry-200', text: 'text-cranberry-800' },
  drowning: { bg: 'bg-cranberry-600', text: 'text-white' },
};
```

- [ ] **Step 2: Point `CardListItem` at the shared map**

In `src/features/cards/components/CardListItem.tsx`, delete the local map (lines 9–13):

```ts
const STRAIN_DOT_CLASS: Record<DomainStrain, string> = {
  light: 'bg-success-600',
  manageable: 'bg-warning-500',
  drowning: 'bg-error-600',
};
```

and add this import below the existing imports (the `DomainStrain` import on line 7 can stay — it is still used in props typing; if tsc flags it as unused after the deletion, remove `type DomainStrain` from that import):

```ts
import { STRAIN_DOT_CLASS } from './strainColors';
```

- [ ] **Step 3: Update `StrainSelector` options and text classes**

In `src/features/cards/components/StrainSelector.tsx`, replace lines 11–15:

```ts
const OPTIONS: { value: DomainStrain; label: string; activeClass: string }[] = [
  { value: 'light', label: 'Light', activeClass: 'bg-success-600' },
  { value: 'manageable', label: 'Manageable', activeClass: 'bg-warning-500' },
  { value: 'drowning', label: 'Drowning', activeClass: 'bg-error-600' },
];
```

with:

```ts
import { STRAIN_FILL_CLASS } from './strainColors';

const OPTIONS: { value: DomainStrain; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'manageable', label: 'Manageable' },
  { value: 'drowning', label: 'Drowning' },
];
```

(move the `import` line up with the other imports), and replace the two class expressions in the JSX (lines 27–37 of the original):

```tsx
className={`flex-1 py-2.5 rounded-lg items-center ${
  value === opt.value ? STRAIN_FILL_CLASS[opt.value].bg : 'border border-border'
}`}
```

```tsx
className={`text-[13px] font-semibold ${
  value === opt.value ? STRAIN_FILL_CLASS[opt.value].text : 'text-text-secondary'
}`}
```

- [ ] **Step 4: Add the new classes to the Tailwind safelist**

In `tailwind.config.js`, inside the existing `safelist` array, update the cranberry and neutral lines to:

```js
    // cranberry (now tangerine) — accent / strain
    'bg-cranberry-50', 'bg-cranberry-200', 'bg-cranberry-500', 'bg-cranberry-600',
    'border-cranberry-200',
    'text-cranberry-600', 'text-cranberry-500', 'text-cranberry-300', 'text-cranberry-800',
```

```js
    // neutral
    'bg-neutral-300', 'bg-neutral-500',
```

- [ ] **Step 5: Full check**

Run: `npx jest && npx tsc --noEmit && npm run lint`
Expected: jest all pass; tsc silent; lint shows only the 6 pre-existing problems in `src/app/navigation/types.ts` and `src/shared/constants/tokens.d.ts`

- [ ] **Step 6: Commit**

```bash
git add src/features/cards/components/strainColors.ts src/features/cards/components/CardListItem.tsx src/features/cards/components/StrainSelector.tsx tailwind.config.js
git commit -m "feat: strain indicator uses tangerine intensity ramp, not success/warning/error"
```

---

### Task 4: Simulator visual pass (HUMAN GATE — do not skip)

This is the gate before the PR opens (Sherbet's lesson). Jest cannot see rendered colors; a human must.

- [ ] **Step 1: Launch the app**

Run: `npm start`, then `i` for the iOS simulator (needs `.env` present — it is, locally).

- [ ] **Step 2: Walk every surface with this checklist**

- Home / card list: CTA, active tab, selected card = cobalt; strain dots = gray / pale tangerine / full tangerine; no leftover teal/plum/green anywhere
- Net screen: count badge tangerine; routed chips cobalt; unrouted stays gray
- Domain detail: strain selector — "Light" fills gray/white text, "Manageable" pale tangerine/dark text, "Drowning" deep tangerine/white text; delete button still red
- Deal flow (SwipeModeScreen, split button): action buttons cobalt; celebration moment tangerine
- Auth + profile screens: cobalt only, no stray hues
- **Contrast spots:** anywhere old `primary` vs `secondary` or `evergreen` sat side-by-side and now look identical cobalt — note each, demote one side to a neutral class, and re-check
- **Tangerine scarcity audit:** count where tangerine appears; if it shows up anywhere that isn't strain / Net badge / celebration, replace with cobalt or neutral

- [ ] **Step 3: Commit any demotions/fixes from the pass**

```bash
git add -A tandem-mobile/src
git commit -m "fix: neutral demotions from visual pass"
```

(Skip the commit if the pass found nothing.)

---

### Task 5: PR mechanics

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin cobaltTangerine
gh pr create --title "Cobalt & Tangerine — two-hue color injection" --body "Implements docs/plans/2026-07-19-cobalt-tangerine-design.md: cobalt brand + tangerine accent injected via token remap; neutrals, error red, font, and layout untouched. Strain now rides a tangerine intensity ramp. Includes a jest guard enforcing the two-hue palette. Supersedes #4."
```

- [ ] **Step 2: Close the superseded Sherbet PR**

```bash
gh pr close 4 --comment "Superseded by the Cobalt & Tangerine direction (see docs/plans/2026-07-19-cobalt-tangerine-design.md). Branch preserved."
```

Expected: PR #4 shows CLOSED; new PR open against `main`.
