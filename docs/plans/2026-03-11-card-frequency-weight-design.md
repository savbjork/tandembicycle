# Card Frequency & Weight Design

**Date:** 2026-03-11
**Status:** Approved

## Overview

Add a `frequency` field to each card — `'daily'`, `'weekly'`, or `'as-needed'` — which maps to a weight (3, 2, 1 respectively). Frequency drives two things: the Balance Meter switches from card count to weighted points, and card list items get a background tint based on frequency. Default cards ship with frequency pre-assigned; users can edit it on the Card Detail screen.

---

## Data Model

**`Card` interface** (`src/shared/data/FakeDataStore.ts`):

```ts
export type CardFrequency = 'daily' | 'weekly' | 'as-needed';

export interface Card {
    dbId?: string;
    name: string;
    owner: Person;
    frequency: CardFrequency;  // non-optional, always has a value
    note?: string;
    archived?: boolean;
    archivedAt?: string;
}
```

**Weight constants:**
```ts
export const FREQUENCY_WEIGHT: Record<CardFrequency, number> = {
    daily: 3,
    weekly: 2,
    'as-needed': 1,
};
```

**Default:** `'as-needed'` for all user-created cards. `frequency` is never blank.

**Supabase:** Add `frequency` text column to `cards` table, default `'as-needed'`. Persist in `addCard`, `updateCard`, and `resetToDefaults` store actions.

---

## Balance Meter

Replace raw card count with weighted points.

- Sum `FREQUENCY_WEIGHT[card.frequency]` for each person's cards instead of counting cards
- Large bold numbers show weighted points (e.g., "42" vs "31")
- Progress bar fills proportionally to weighted totals
- Subtitle reads "X pts total" (not "X cards total")

---

## Card List Item — Background Tint

Background and border color shift based on `card.frequency`:

| Frequency   | Background       | Border               |
|-------------|-----------------|----------------------|
| daily       | `bg-primary-50`  | `border-primary-200` |
| weekly      | `bg-secondary-50`| `border-secondary-200`|
| as-needed   | `bg-surface`     | `border-border-light` |

Selection state (`isSelected`) still overrides border color. No other layout changes to `CardListItem`.

---

## Frequency Selector — Card Detail Screen

A segmented control block placed between the "Not Owner" banner and the "To Do" section. Same visual container as Notes (`bg-surface rounded-xl p-4 mb-4 border border-border-light shadow-sm`).

- Three segments: **Daily** | **Weekly** | **As needed**
- Active segment: filled background (primary-600 for daily, secondary-600 for weekly, neutral border/fill for as-needed), white text
- Inactive segments: transparent background, muted text
- Tapping a segment calls `updateCard(card.name, { frequency: newValue })` immediately
- Only shown when `isOwner === true` (same gate as Notes and Archive)
- When not owner, frequency is displayed read-only as a simple label

---

## Default Cards

Pre-populate `frequency` on default cards in seed data. Each default card gets an appropriate frequency assigned (e.g., cooking = daily, groceries = weekly, taxes = as-needed). Exact assignments determined during implementation.

---

## Supabase Persistence

- `cards` table: add `frequency TEXT NOT NULL DEFAULT 'as-needed'`
- `addCard`: include `frequency` in insert payload
- `updateCard`: map `updates.frequency` → `dbUpdates.frequency`
- `resetToDefaults`: include `frequency` in each card insert

---

## Files Affected

| File | Change |
|------|--------|
| `src/shared/data/FakeDataStore.ts` | Add `CardFrequency` type, `FREQUENCY_WEIGHT` constant, `frequency` field on `Card` |
| `src/store/slices/dataStore.ts` | Persist `frequency` in addCard, updateCard, resetToDefaults |
| `src/features/cards/components/CardListItem.tsx` | Background/border tint from frequency |
| `src/features/cards/components/BalanceMeter.tsx` | Switch to weighted points |
| `src/features/cards/screens/CardDetailScreen.tsx` | Add frequency segmented control |
| `supabase/` | Migration: add `frequency` column to `cards` table |
| Default card seed data | Assign frequency to each default card |
