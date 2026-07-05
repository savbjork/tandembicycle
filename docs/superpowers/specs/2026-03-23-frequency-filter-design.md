# Frequency Filter for Cards Screen

**Date:** 2026-03-23

## Summary

Add a single-select frequency filter to the Cards screen filter sheet, allowing users to narrow the card list to a specific frequency (`daily`, `weekly`, or `as-needed`), or view all cards.

## Design

### State

Add `frequencyFilter: CardFrequency | 'all'` to `FilterPreferences` in `useCardsFilterPreferences`, defaulting to `'all'`. Persisted to AsyncStorage alongside existing prefs.

### Filtering logic

`useCardsFiltering` receives a new `frequencyFilter` param. When it is not `'all'`, cards where `card.frequency !== frequencyFilter` are excluded from `filteredCards`.

### UI

`CardFilterSheet` gets a new "Frequency" section rendered as a `ChipGroup` with four options: All / Daily / Weekly / As-needed. New props: `frequencyFilter: CardFrequency | 'all'` and `onFrequencyFilterChange: (v: CardFrequency | 'all') => void`.

The active-filter dot indicator in `CardsScreen` gains `|| frequencyFilter !== 'all'`.

## Files Changed

| File | Change |
|------|--------|
| `src/features/cards/hooks/useCardsFilterPreferences.ts` | Add `frequencyFilter` field and default |
| `src/features/cards/hooks/useCardsFiltering.ts` | Add `frequencyFilter` param and filter logic |
| `src/features/cards/components/CardFilterSheet.tsx` | Add Frequency `ChipGroup` section |
| `src/features/cards/screens/CardsScreen.tsx` | Wire up new filter, update dot indicator |
