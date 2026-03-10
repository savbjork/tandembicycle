# Archive Screen Design

## Overview

Add an archive screen accessible from the bottom of the Cards page, where users can view archived cards, see how long until they are permanently deleted, and restore cards back to active.

## Data Model Changes

- Add `archivedAt?: string` (ISO date string) to the `Card` type in `FakeDataStore.ts`
- Update `archiveCard` in `dataStore.ts` to set `archivedAt: new Date().toISOString()` alongside `archived: true`
- Persist `archived_at` to Supabase in `archiveCard`
- Add `unarchiveCard(names: string[])` action to the store to restore cards (clear `archived` and `archivedAt`, update Supabase)

## Navigation

- Add `ArchivedCards` route to `MainStackParamList` in `navigation/types.ts`
- Register the screen in the main stack navigator

## ArchivedCardsScreen

**Location:** `features/cards/screens/ArchivedCardsScreen.tsx`

**On mount behavior:**
- Find all cards where `archivedAt` is more than 30 days ago
- Call `removeCard` on each expired card (permanent deletion, clears from Supabase)

**Card list:**
- Shows only cards with `archived: true` (after expired ones are removed)
- Sorted by `archivedAt` descending (most recently archived first)
- Each row displays the card name and "Deletes in X days" in muted text

**Multi-select restore:**
- Tap a card to toggle selection (checkmark indicator)
- When one or more cards are selected, a "Restore (N)" button appears in the screen header
- Tapping Restore calls `unarchiveCard` with selected card names, then deselects all

## CardsScreen Button

- A secondary-style text button with an archive icon placed at the bottom of the `ScrollView`, below the card list
- Styled with muted text color (text-text-secondary), not a primary CTA
- Hidden when `isSelecting` is true
- Navigates to `ArchivedCards`
