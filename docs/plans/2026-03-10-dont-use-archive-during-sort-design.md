# "Don't Use" / Archive During Sort Design

**Date:** 2026-03-10
**Branch:** taskScreen

## Overview

Add a "Don't use" button to SwipeModeScreen during card sorting. Pressing it archives the card (soft-delete), excluding it from the household card list. Restore UI is future work.

## Data Model

### Card type (`FakeDataStore.ts`)
Add `archived?: boolean` to the `Card` interface.

### Supabase
Add `archived boolean NOT NULL DEFAULT false` column to the `cards` table.

### DataStore (`dataStore.ts`)
Add `archiveCard(name: string)` action that:
- Sets `archived: true` on the card in local state
- Persists to Supabase: `update({ archived: true }).eq('id', card.dbId)`

## Components & Changes

### `SwipeModeScreen`
- Add a "Don't use" button below the member assignment buttons
- Pressing it calls a new `onArchive(cardIndex)` prop and advances to the next card (same flow as assigning a member)

### `useCardShuffle`
- Add `archivedCardNames: string[]` state (starts empty each shuffle session)
- Add `archiveCard(cardIndex: number)` callback: appends card name to `archivedCardNames`, advances `currentCardIndex`
- Update `finishShuffle`: after `reassignCards`/`resetToDefaults`, call `archiveCard` store action for each name in `archivedCardNames`, then reset `archivedCardNames` to `[]`
- Export `archiveCard` from hook return

### `CardsScreen`
- Pass `archiveCard` as `onArchive` prop to `SwipeModeScreen`

### `useCardsFiltering`
- Filter out cards where `archived === true` from the filtered card list

## Behavior

| Action | Result |
|---|---|
| "Don't use" during sort | Card archived, advances to next card |
| Complete sort | Assigned cards saved, archived cards soft-deleted in DB |
| Cancel sort (X) | Nothing saved, nothing archived |
| View card list | Archived cards invisible |
