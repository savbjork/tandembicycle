# Cards Screen: Sort by User and Task Count

## Summary

Sort the Cards screen list so the current user's cards appear first, with a secondary sort by the number of tasks the current user has on each card (descending).

## Problem

Cards are currently displayed in an arbitrary order (store order). There's no visual priority given to the current user's cards or to cards with more work.

## Design

### Sort logic (in `useCardsFiltering.ts`)

Add a `.sort()` at the end of the `filteredCards` useMemo, after the existing filter step.

Sort priority:
1. **Ownership** — cards owned by `currentUser` sort before cards owned by others
2. **Task count** — within each ownership group, cards with more of the current user's tasks sort first (descending)

### Task count for sorting

Use raw task count (all tasks where `t.card === card.name && t.owner === currentUser`), **ignoring** `taskTimeFilter`, `hideCompleted`, and `hideUndated`. This keeps sort order stable regardless of active filters.

### Scope

- Change is isolated to `useCardsFiltering.ts`
- No new parameters, no API changes, no UI changes
- Applies when `filter === 'all'` and `filter === 'me'` (natural behavior, no special casing needed)
