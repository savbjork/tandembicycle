# Cobalt & Tangerine — bold two-hue color injection

**Date:** 2026-07-19
**Branch:** `cobaltTangerine`
**Supersedes:** Sherbet skin (PR #4, `playfulColors`) — to be closed unmerged when this PR opens.

## Goal

Make Tandem feel playful and confident through color, while staying cohesive and adult. Sherbet failed on three counts: six hue families felt uncohesive, pastels read as childish for a mental-load app, and the result was busy. The fix is scarcity: exactly two hues, injected into the existing neutral system.

## Decisions (and what was rejected)

| Decision | Chosen | Rejected alternatives |
|---|---|---|
| Mood | Playful, bold | "Calm/peaceful" direction (explored, reversed by Savannah) |
| Palette rule | 2 hue families with tints/shades + existing neutrals | Strict 3 swatches; warm neutral family (deferred, see Out of scope) |
| Color roles | Brand + accent | Per-partner colors; act-vs-observe split |
| Hues | Cobalt brand + Tangerine accent | Spruce/Clay (too muted), Teal/Hot-pink, Grape/Chartreuse, Cherry/Sky |
| Playfulness source | Color only | Shape/type/motion changes (explored, deferred) |
| Font | Keep NanumMyeongjo | Fraunces+Nunito, Nunito, Quicksand |
| Error color | Functional red exception, unchanged | Tangerine or cobalt doing danger duty |
| Strain encoding | Tangerine intensity ramp | Size-based dot; keeping legacy multi-hue scale |
| Scope | Whole app | Core screens first |

## Role rules

The system that keeps two hues from going busy:

- **Cobalt (brand — works):** primary buttons, active tab, selected states, links, toggles, focus rings, progress, routed-destination chips.
- **Tangerine (accent — plays):** strain signal, "N in the Net" count badge, deal-complete celebratory moment. Nothing else. Rarity is what makes it read as intentional.
- **Neutrals (unchanged):** current white/gray `surface`, `border`, `text`, `neutral` tokens stay exactly as they are. If a component isn't an action, a selection, or a signal, it gets no hue.
- **Error (unchanged):** existing `error` red ramp, used only for destructive/error moments; not part of the brand palette.

**Strain ramp:** none/fine → `border.strong` gray `#d1d5db`; moderate → tangerine-200 `#FFC7A3`; high → tangerine-500 `#FF6B2B`. Strain remains a plain dot (no icons/faces).

## New hue ramps

Token *names* are retained; only values change. Two new ramps:

**Cobalt** (replaces teal as `primary`):
`50 #EDF0FD · 100 #DDE3FA · 200 #B8C4F4 · 300 #8FA0EC · 400 #5C74E6 · 500 #2B4BE0 · 600 #1F3AB8 · 700 #182D8F · 800 #112066 · 900 #0A1340`

**Tangerine** (replaces cranberry):
`50 #FFF3EB · 100 #FFE1D1 · 200 #FFC7A3 · 300 #FFA269 · 400 #FF873F · 500 #FF6B2B · 600 #E25812 · 700 #C24308 · 800 #93330A · 900 #632205`

## Token remap (`tokens.js`)

| Token | New value | Rationale |
|---|---|---|
| `primary` | cobalt ramp | Brand hue |
| `secondary` | cobalt ramp (same values) | People elements consolidate into brand; visual pass may demote some to neutral where primary/secondary contrast previously carried meaning |
| `cranberry` | tangerine ramp | Frequency/attention accents |
| `evergreen` | cobalt ramp | Task actions consolidate into brand |
| `success` | cobalt equivalents (50 `#EDF0FD`, 100 `#DDE3FA`, 600 `#1F3AB8`, 700 `#182D8F`) | Success is a brand moment, not a third hue |
| `warning` | tangerine equivalents (50/100/500/600/700/800 from ramp) | Warnings are attention signals |
| `info` | 100 `#DDE3FA`, 700 `#182D8F` | Cobalt tint |
| `surface`, `border`, `text`, `neutral`, `error` | **unchanged** | Explicit decision: don't touch neutrals for now |

`COLORS` in `colors.ts` and the Tailwind config consume `tokens.js`, so the swap itself requires no component changes; the visual pass (below) may then demote individual elements to neutral where a lost color distinction mattered. The `safelist` in `tailwind.config.js` keeps working since class names don't change.

## Out of scope (explicitly deferred)

- **Warm neutrals** (ivory background, cream cards): Savannah's call — "do not add warm neutrals, just inject the bold colors." Clean follow-up if the app feels cold later.
- **Shape/type/motion playfulness** (chunky radii, sticker shadows, tilts, font change): explored in mockups, deferred.
- **Dark mode:** does not exist today; not introduced here.

## Verification

1. `npx jest` — pure-logic tests, should be unaffected.
2. `npx tsc --noEmit` and `npm run lint` (6 pre-existing lint problems in `types.ts`/`tokens.d.ts` are known and out of scope).
3. **Human simulator visual pass — gate before the PR opens** (Sherbet's lesson): walk Home, Net, Domains, domain detail (strain selector), deal flow, auth, profile. Specifically check spots where `primary` vs `secondary` or `evergreen` previously provided contrast that is now identical cobalt — demote one side to neutral where the distinction mattered.

## Mockup reference

Approved mockups live in `.superpowers/brainstorm/14584-1784493874/content/` (gitignored): `final-mockup.html` is the approved target; `playful-palettes.html` (P1) and `font-directions.html` (F1) record the choices.
