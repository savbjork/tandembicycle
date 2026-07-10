# Playful Colors (Sherbet) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Sherbet colors-only skin (spec: `docs/plans/2026-07-10-playful-colors-design.md`) — cream page background, one warm pastel hue per domain, filled pill action buttons — with zero layout, functionality, font, or icon changes.

**Architecture:** New color tokens in `tokens.js`/Tailwind; a pure, tested `domainHue(name)` helper; then mechanical NativeWind class swaps per screen. Hue→class mappings are lookup tables of COMPLETE literal class strings (dynamic class construction silently fails NativeWind's JIT scan — this is the one hard constraint in every UI task).

**Tech Stack:** React Native + NativeWind on branch `playfulColors` (based on merged main). All commands from `tandem-mobile/`.

**Gates for every task:** `npx tsc --noEmit && npx jest && npm run lint` — lint budget is the 6 pre-existing problems in `src/app/navigation/types.ts` and `src/shared/constants/tokens.d.ts` only. Run `npx prettier --write` on touched files before committing.

**Explicitly out of scope (user decision):** card tilts, font changes, mood-face/emoji strain icons, any change to the existing `primary` (teal) / `secondary` (plum) scales, partner-row styling (stays white/neutral).

---

### Task 1: Sherbet tokens

**Files:**
- Modify: `tandem-mobile/src/shared/constants/tokens.js`
- Modify: `tandem-mobile/src/shared/constants/tokens.d.ts` (mirror the shape if the file declares the token types — read it first)

- [ ] **Step 1: Add to the exported object in tokens.js** (after the existing `border` block, following the file's nesting style):

```js
  // Playful skin — page chrome (spec: 2026-07-10-playful-colors-design.md)
  cream: '#FBF6ED',
  warm: {
    border: '#E5DFD2',
    label: '#A2542B',
  },
  // Sherbet domain hue families — all-warm pastels, one lightness band.
  // Title = darkest stop, sub = mid stop; never plain gray/black on a tinted fill.
  sherbet: {
    mint: { fill: '#E8F5E9', line: '#93CFA0', title: '#1F5C34', sub: '#2F7A4A' },
    peach: { fill: '#FDEBE0', line: '#F2A67E', title: '#7A3617', sub: '#A2542B' },
    lilac: { fill: '#F3ECFA', line: '#C3A6E8', title: '#4A2C73', sub: '#6C4A9E' },
    butter: { fill: '#FCF1D8', line: '#EDC35F', title: '#6E4A08', sub: '#96690F' },
    blush: { fill: '#FCE9EE', line: '#F0A0B8', title: '#7C2742', sub: '#A84064' },
    coral: { fill: '#FDE8E4', line: '#F09D8C', title: '#7D2B1C', sub: '#A64530' },
  },
  // Saturated action accents — the ONLY loud elements on screen.
  // Additions; do not touch primary (teal) / secondary (plum).
  accent: {
    catch: '#D4537E',
    action: '#7C5CBF',
    claim: '#CE6A4A',
  },
```

Resulting class names: `bg-cream`, `border-warm-border`, `text-warm-label`, `bg-sherbet-mint-fill`, `border-sherbet-mint-line`, `text-sherbet-mint-title`, `text-sherbet-mint-sub`, `bg-accent-catch`, etc.

- [ ] **Step 2: Verify Tailwind resolves the new classes**

Run: `npx tailwindcss --help >/dev/null && npx tsc --noEmit` (config is consumed by NativeWind at bundle time; the real check is Task 3's visual pass — here just confirm no config syntax error by running `node -e "require('./tailwind.config.js')"`).
Expected: no error output.

- [ ] **Step 3: Commit**

```bash
git add src/shared/constants/tokens.js src/shared/constants/tokens.d.ts
git commit -m "feat: sherbet palette tokens — cream chrome, six domain families, action accents"
```

---

### Task 2: domainHue helper (TDD)

**Files:**
- Create: `tandem-mobile/src/shared/utils/domainHue.ts`
- Test: `tandem-mobile/src/shared/utils/__tests__/domainHue.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest domainHue`
Expected: FAIL — cannot find module '../domainHue'

- [ ] **Step 3: Implement**

```ts
export const HUE_FAMILIES = ['mint', 'peach', 'lilac', 'butter', 'blush', 'coral'] as const;

export type HueFamily = (typeof HUE_FAMILIES)[number];

// Stable hash of the domain name → one of six sherbet families.
// Pure function of the name: both partners see identical colors with no
// persistence or sync. Char codes weighted by position so single-letter
// swaps ("Pets" vs "Sets") don't collide constantly.
export const domainHue = (name: string): HueFamily => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return HUE_FAMILIES[hash % HUE_FAMILIES.length];
};
```

- [ ] **Step 4: Run to verify pass**

Run: `npx jest domainHue`
Expected: PASS, 3 tests (full suite: 15)

- [ ] **Step 5: Commit**

```bash
git add src/shared/utils/domainHue.ts src/shared/utils/__tests__/domainHue.test.ts
git commit -m "feat: domainHue — stable name-to-sherbet-family hash"
```

---

### Task 3: Domains screen family (CardListItem, UnclaimedDomainRow, StrainCheckBanner, CardsScreen)

**Files:**
- Modify: `src/features/cards/components/CardListItem.tsx`
- Modify: `src/features/cards/components/UnclaimedDomainRow.tsx`
- Modify: `src/features/cards/components/StrainCheckBanner.tsx`
- Modify: `src/features/cards/screens/CardsScreen.tsx`
- Modify (minimal): `src/shared/components/ui/AddButton.tsx`

READ each file before editing. All hue-dependent classes go through literal maps — e.g. in CardListItem:

```ts
import { domainHue, type HueFamily } from '@shared/utils/domainHue';

const HUE_CARD_CLASS: Record<HueFamily, string> = {
  mint: 'bg-sherbet-mint-fill border-sherbet-mint-line',
  peach: 'bg-sherbet-peach-fill border-sherbet-peach-line',
  lilac: 'bg-sherbet-lilac-fill border-sherbet-lilac-line',
  butter: 'bg-sherbet-butter-fill border-sherbet-butter-line',
  blush: 'bg-sherbet-blush-fill border-sherbet-blush-line',
  coral: 'bg-sherbet-coral-fill border-sherbet-coral-line',
};

const HUE_TITLE_CLASS: Record<HueFamily, string> = {
  mint: 'text-sherbet-mint-title',
  peach: 'text-sherbet-peach-title',
  lilac: 'text-sherbet-lilac-title',
  butter: 'text-sherbet-butter-title',
  blush: 'text-sherbet-blush-title',
  coral: 'text-sherbet-coral-title',
};

const HUE_SUB_CLASS: Record<HueFamily, string> = {
  mint: 'text-sherbet-mint-sub',
  peach: 'text-sherbet-peach-sub',
  lilac: 'text-sherbet-lilac-sub',
  butter: 'text-sherbet-butter-sub',
  blush: 'text-sherbet-blush-sub',
  coral: 'text-sherbet-coral-sub',
};
```

- [ ] **Step 1: CardListItem** — for the card container, replace the static `bg-surface border-border-light` pair with `HUE_CARD_CLASS[domainHue(card.name)]` (keep the `isSelected` border override exactly as-is, applied after). Card title text gets `HUE_TITLE_CLASS[...]`; the task-count/summary line gets `HUE_SUB_CLASS[...]`. Strain dot classes unchanged. Task rows inside the card keep their current styling.
- [ ] **Step 2: UnclaimedDomainRow** — container `bg-surface-dim` → `bg-cream`; Claim button `bg-secondary-600` → `bg-accent-claim`. Dashed neutral border stays.
- [ ] **Step 3: StrainCheckBanner** — banner container → `bg-sherbet-butter-fill border-sherbet-butter-line`; title text → `text-sherbet-butter-title`; subtitle → `text-sherbet-butter-sub`; Rate button → `bg-accent-action`.
- [ ] **Step 4: CardsScreen** — root `bg-surface-dim` → `bg-cream`; section labels (`Yours`/`Unclaimed`/partner-name headers — find the actual label elements) → `text-warm-label`; search pill border `border-border` → `border-warm-border`.
- [ ] **Step 5: AddButton** — read it; if it hardcodes `bg-primary-600`, add an optional `className` override prop (default preserves current look) and pass `bg-accent-catch` from CardsScreen's header only. Do not change other AddButton call sites.
- [ ] **Step 6: Gates + visual check** — gates green, then simulator: Domains list shows tinted own-domains (stable hues), cream background, butter banner, coral Claim.
- [ ] **Step 7: Commit** — `git commit -m "feat: sherbet skin — Domains screen family"`

---

### Task 4: NetScreen

**Files:**
- Modify: `src/features/net/screens/NetScreen.tsx`

Reuse the SAME literal maps by extracting them in Task 3 to `src/features/cards/components/hueClasses.ts` (export `HUE_CARD_CLASS`, `HUE_TITLE_CLASS`, `HUE_SUB_CLASS`, plus add `HUE_CHIP_CLASS`):

```ts
export const HUE_CHIP_CLASS: Record<HueFamily, string> = {
  mint: 'bg-sherbet-mint-fill text-sherbet-mint-title',
  peach: 'bg-sherbet-peach-fill text-sherbet-peach-title',
  lilac: 'bg-sherbet-lilac-fill text-sherbet-lilac-title',
  butter: 'bg-sherbet-butter-fill text-sherbet-butter-title',
  blush: 'bg-sherbet-blush-fill text-sherbet-blush-title',
  coral: 'bg-sherbet-coral-fill text-sherbet-coral-title',
};
```

(If Task 3 has already run, the extraction exists; otherwise create it here and refactor Task 3's imports — whichever task runs second uses the shared module. Adjust import path/location if reviewers prefer `@shared/utils` next to domainHue — one clear home, no duplication.)

- [ ] **Step 1: Root + capture** — root `bg-surface-dim` → `bg-cream`; Catch button `bg-primary-600` → `bg-accent-catch` (disabled state `bg-border` unchanged); capture card border → `border-warm-border`.
- [ ] **Step 2: Unrouted + returned items** — fixed lilac (no domain yet): container `bg-surface border-border-light` → `bg-sherbet-lilac-fill border-sherbet-lilac-line`; content text → `text-sherbet-lilac-title`; timestamp/meta → `text-sherbet-lilac-sub`. Returned items: same lilac treatment; Re-route button → `bg-accent-action`.
- [ ] **Step 3: Triage cards** — card stays white but border → `border-warm-border`; the domain name in the meta line becomes a chip: `HUE_CHIP_CLASS[domainHue(item.domain!)]` (item.domain is guaranteed for triage items — note the non-null comment) with `rounded-full px-2 py-0.5 text-[11px] font-semibold`; TriageButton variants: Task primary → `bg-accent-action`; add two new quiet variants — Done `bg-sherbet-mint-fill` + `text-sherbet-mint-title`, Someday `bg-sherbet-butter-fill` + `text-sherbet-butter-title`; Decline unchanged outline.
- [ ] **Step 4: Section labels** → `text-warm-label` (To route / Returned to you / Your triage / Caught).
- [ ] **Step 5: Gates + visual check** — capture → lilac item; route → chip echoes the domain's list hue exactly.
- [ ] **Step 6: Commit** — `git commit -m "feat: sherbet skin — Net screen"`

---

### Task 5: Domain detail + Tasks screens

**Files:**
- Modify: `src/features/cards/screens/CardDetailScreen.tsx`
- Modify: `src/features/tasks/screens/TasksScreen.tsx`
- Modify: `src/features/tasks/screens/TaskDetailScreen.tsx`

- [ ] **Step 1: CardDetailScreen roots** — all three view branches (head/non-head/unclaimed): root `bg-surface-dim` → `bg-cream`.
- [ ] **Step 2: Title tint block (head view)** — wrap the existing EditableTitle header area in a tinted block: `HUE_CARD_CLASS[domainHue(card.name)]` + `rounded-xl p-3 mb-4`, title text `HUE_TITLE_CLASS[...]`. Non-head and unclaimed branches: apply the same tint to their title/name element only (the wall content/copy stays neutral).
- [ ] **Step 3: Someday rows (head view)** — `bg-sherbet-butter-fill border-sherbet-butter-line`, content `text-sherbet-butter-title`; their Task action button → `bg-accent-action`; Done action keeps the mint quiet variant from Task 4 (import from the shared hueClasses module).
- [ ] **Step 4: Claim button (unclaimed view)** → `bg-accent-claim`.
- [ ] **Step 5: Tasks screens** — TasksScreen and TaskDetailScreen roots `bg-surface-dim` → `bg-cream`; no per-task coloring (spec).
- [ ] **Step 6: Gates + commit** — `git commit -m "feat: sherbet skin — domain detail and tasks screens"`

---

### Task 6: Final gate + visual pass

- [ ] **Step 1:** `npx tsc --noEmit && npx jest && npm run lint` — 15 tests; lint at the 6-problem budget.
- [ ] **Step 2:** `grep -rn "bg-surface-dim" src/features` — remaining hits should be deliberate (sheets/modals may keep neutral surfaces); justify or convert each.
- [ ] **Step 3:** Simulator pass, one account: Domains (tints, banner, claim), Net (capture→route→triage with chip echo), domain detail (tint block, butter someday), Tasks (cream). Confirm strain dots and StrainSelector actives are unchanged.
- [ ] **Step 4:** Push and open PR titled "Sherbet skin — colors-only playful refresh" referencing the design doc; body notes zero functional changes and the literal-class constraint.

---

## Self-review notes (applied)

- **Spec coverage:** page chrome (T1/T3/T4/T5), six families + assignment rule (T1/T2), buttons table (T3/T4/T5), unchanged-list respected (strain dots, fonts, icons, partner rows, layout). Screens table fully mapped.
- **Type consistency:** `HueFamily` exported once from domainHue; hue class maps live in one shared module (extraction ordering handled in Task 4's preamble).
- **No placeholders:** every class string is complete and literal; token block is full.
- **Known risk called out:** NativeWind JIT literal-class constraint stated in the header and enforced by the map pattern in every UI task.
