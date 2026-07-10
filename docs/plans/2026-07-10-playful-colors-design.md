# Playful Colors Skin — Design

**Date:** 2026-07-10
**Status:** Approved (mockup round 2 colors-only; palette round 3 — "Sherbet" family chosen over stock ramps, muted Garden, and bright Confetti options)

## Overview

A colors-only visual refresh: warm cream page background, one stable pastel hue per
domain, filled pill buttons, and warm section labels. **No layout, functionality,
font, icon, or component-structure changes.** Explicitly excluded by decision:
card tilts, font changes (Barriecito stays tab-bar-only), and mood-face/emoji
strain indicators — strain remains a plain colored dot.

Everything ships as NativeWind class swaps plus one pure helper (`domainHue`) and
a Tailwind palette extension. Builds on the `netDomains` branch (branch:
`playfulColors`), intended as a follow-up PR after PR #3 merges.

## Palette

### Page & chrome

| Token | Hex | Replaces |
|---|---|---|
| `cream` (page bg) | `#FBF6ED` | `surface-dim` usage on screen roots |
| `border-warm` | `#E5DFD2` | `border-light` on cream surfaces |
| `label-warm` (section labels) | `#A2542B` | gray section-label text (peach sub stop, matches Sherbet) |

White card surfaces (`bg-surface`) stay white.

### Domain hue families (6) — "Sherbet"

All-warm pastels: fills share one lightness band, borders one saturation band,
and every hue carries the cream's warm undertone (this cohesion rule is why the
stock-ramp palette from mockup round 2 was replaced). Assigned per domain, used
for the domain's list card, its chip on triage items, and a tint block on its
detail screen.

| Family | Fill (bg) | Border | Text (title) | Text (chip/sub) |
|---|---|---|---|---|
| mint | `#E8F5E9` | `#93CFA0` | `#1F5C34` | `#2F7A4A` |
| peach | `#FDEBE0` | `#F2A67E` | `#7A3617` | `#A2542B` |
| lilac | `#F3ECFA` | `#C3A6E8` | `#4A2C73` | `#6C4A9E` |
| butter | `#FCF1D8` | `#EDC35F` | `#6E4A08` | `#96690F` |
| blush | `#FCE9EE` | `#F0A0B8` | `#7C2742` | `#A84064` |
| coral | `#FDE8E4` | `#F09D8C` | `#7D2B1C` | `#A64530` |

Rule: title text always the darkest stop of the same family; secondary text the
mid stop of the same family; never plain black/gray on a tinted fill.

### Buttons (filled pills, same sizes/positions as today)

Buttons are the only saturated elements on screen — deliberately, so actions pop
above the ambient pastel domain tints.

| Action | Style |
|---|---|
| Catch, Add (+) | filled `#D4537E` (pink), white text |
| Rate, Task | filled `#7C5CBF` (warm purple accent — new token, does NOT replace the global `secondary` scale), white text |
| Claim | filled `#CE6A4A` (warm coral accent), white text |
| Done | mint tint fill, mint title text |
| Someday | butter tint fill, butter title text |
| Decline, Cancel | white/outline neutral (deliberately quiet) |

### Unchanged

Strain dot colors (`success-600` / `warning-500` / `error-600`), all icons, all
fonts, StrainSelector active fills, partner rows (stay white/neutral — the
closed-door look is intentional), and every layout primitive.

## Hue assignment

`domainHue(name: string): HueFamily` — pure function in `src/shared/utils/`.
Stable hash of the domain name (sum of char codes is fine) mod 6, mapped to the
family list above in fixed order. Same name → same hue forever, both partners see
identical colors, no persistence needed.

**NativeWind constraint (hard requirement):** dynamic class strings do not
compile. Hue → class mappings must be lookup tables of complete literal class
strings (`Record<HueFamily, string>`), the same pattern as `STRAIN_DOT_CLASS` in
`CardListItem`. The helper returns the family key; components index literal maps.

## Per-screen changes

- **All screen roots:** `bg-surface-dim` → cream.
- **Domains (CardsScreen):** own-domain `CardListItem` gets its family fill +
  border + title/sub text colors; task-count chip becomes white pill with family
  mid text. Section labels (`Yours` / `Unclaimed` / partner name) in `label-warm`.
  Add (+) header button filled pink. UnclaimedDomainRow: cream bg, dashed neutral
  border, Claim button coral. PartnerDomainRow: unchanged white.
- **StrainCheckBanner:** butter tint fill + butter border/text; Rate button purple.
- **Net (NetScreen):** capture card stays white; Catch button pink pill. Unrouted
  ("To route") and returned items: fixed lilac tint (they have no domain yet).
  Triage items: white card, domain chip in the item's domain family tint, action
  buttons per the button table. "Caught" section unchanged (faded).
- **Domain detail (CardDetailScreen):** header area gets the domain's family tint
  block behind the title (fill + darkest-stop title text); body cards stay white.
  Someday rows: butter tint. Non-head wall and unclaimed views: cream + neutral,
  plus the domain tint only on the title block.
- **Tasks screens:** cream bg; task rows stay white; no per-task coloring.

## Files affected

| File | Change |
|---|---|
| `tandem-mobile/tailwind.config.js` + `src/shared/constants/tokens.js` | add cream/border-warm/label-warm + 6 hue families (fill/border/text stops) |
| `src/shared/utils/domainHue.ts` (new) | pure hash → family helper, unit-tested |
| `src/features/cards/components/CardListItem.tsx` | family fill/border/text via literal maps |
| `src/features/cards/components/UnclaimedDomainRow.tsx` | coral Claim, cream bg |
| `src/features/cards/components/StrainCheckBanner.tsx` | butter tint, purple Rate |
| `src/features/cards/screens/CardsScreen.tsx` | cream root, warm labels, pink Add |
| `src/features/cards/screens/CardDetailScreen.tsx` | domain-tint title block, butter someday rows |
| `src/features/net/screens/NetScreen.tsx` | cream root, pink Catch, lilac unrouted/returned, tinted domain chips, button colors |
| `src/features/tasks/screens/TasksScreen.tsx`, `TaskDetailScreen.tsx` | cream root |

## Testing

- Unit: `domainHue` — deterministic, uniform-ish over the 6 families, stable for
  known names.
- Visual: manual pass over Domains / Net / detail screens in the simulator; both
  partners must see identical hues for the same domain (pure function of name —
  no state, so this holds by construction).
- Gates unchanged: `npx tsc --noEmit && npx jest && npm run lint` (lint budget:
  the 6 pre-existing problems only).
