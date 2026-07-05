# Default Cards Workflow Design

**Date:** 2026-03-10
**Branch:** taskScreen

## Overview

When a household has 0 cards, show a "Start with defaults" button. When pressed (or when "Restart with defaults" is pressed from the ShuffleModal), launch the SwipeModeScreen with the 24 default cards so users can assign each card to a household member. Completing the full sort saves the result; pressing X discards — consistent with existing shuffle behavior.

## Default Cards

24 cards:
- House maintenance, Car maintenance, Bathroom deep clean, Mop, Vacuum, Cook dinner, Laundry, Take out trash, Family events, Family holiday/birthday gifts, Grocery shopping, Cleaning supplies, Plan dates, Car insurance, Rental Insurance, Internet, Dishes, Kitchen deep clean, Pay credit card bills, Manage budget, Retirement, Investing, Taxes, Clean out fridge

## Components & Changes

### `useCardShuffle.ts`
- Add `DEFAULT_CARDS` constant (array of 24 card names)
- Add `isDefaultsMode: boolean` state
- Add `startWithDefaults()`: sets `isDefaultsMode = true`, builds default cards with `currentUser` as placeholder owner, calls `startSwipeShuffle()`
- Update `handleFreshStart`: show confirmation Alert, then set `isDefaultsMode = true` and call `startSwipeShuffle()` with default cards (replaces current hardcoded mini-reset)
- Update `finishShuffle`: if `isDefaultsMode`, call `resetToDefaults(sortedCards, [])` and reset flag; otherwise call `reassignCards` as today
- Export `startWithDefaults` from hook return value

### `CardsScreen.tsx`
- When `cards.length === 0`, render a centered "Start with defaults" button instead of the card list
- Wire button to `startWithDefaults()` from `useCardShuffle`

### `SwipeModeScreen.tsx`
- No changes needed; X already discards, `onSwipedAll` already fires only on completion

## Behavior Rules

| Trigger | Alert? | Result on complete | Result on X |
|---|---|---|---|
| "Start with defaults" (empty state) | No | `resetToDefaults(sorted, [])` | Discard, stay at 0 cards |
| "Restart with defaults" (ShuffleModal) | Yes | `resetToDefaults(sorted, [])` | Discard, keep existing cards |
| Regular reassign shuffle | No | `reassignCards(sorted)` | Discard, keep existing assignments |
| Selective shuffle | No | `reassignCards(selected sorted)` | Discard, keep existing assignments |
