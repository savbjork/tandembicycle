# Cards Sort by User and Task Count Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sort the Cards screen so the current user's cards appear first, with a secondary sort by the number of the current user's tasks on each card (descending).

**Architecture:** Add a `.sort()` step inside the existing `filteredCards` useMemo in `useCardsFiltering.ts`. The sort uses raw task counts (ignoring time/completion filters) to keep order stable as filters change. No new parameters, no API surface changes.

**Tech Stack:** React Native, TypeScript, React hooks (useMemo)

---

### Task 1: Add sort to `useCardsFiltering`

**Files:**
- Modify: `tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts:28-44`

**Step 1: Write the updated `filteredCards` useMemo**

Replace the existing `filteredCards` useMemo (lines 28–44) with:

```ts
const filteredCards = useMemo(() => {
    const filtered = cards.filter((c: Card) => {
        if (c.archived) return false;
        const matchesOwnership = filter === 'all' ? true : c.owner === currentUser;
        if (!matchesOwnership) return false;

        if (hideEmptyCards) {
            const hasTasks = tasks.some((t: Task) =>
                t.card === c.name &&
                isDateInTimeFrame(t.dueDate, taskTimeFilter, hideUndated) &&
                (!hideCompleted || !t.isDone)
            );
            return hasTasks;
        }
        return true;
    });

    return filtered.sort((a: Card, b: Card) => {
        // Primary: current user's cards first
        const aIsOwner = a.owner === currentUser ? 0 : 1;
        const bIsOwner = b.owner === currentUser ? 0 : 1;
        if (aIsOwner !== bIsOwner) return aIsOwner - bIsOwner;

        // Secondary: more of the current user's tasks first (raw count, filter-independent)
        const aCount = tasks.filter((t: Task) => t.card === a.name && t.owner === currentUser).length;
        const bCount = tasks.filter((t: Task) => t.card === b.name && t.owner === currentUser).length;
        return bCount - aCount;
    });
}, [cards, tasks, filter, taskTimeFilter, hideEmptyCards, hideCompleted, hideUndated, currentUser]);
```

**Step 2: Verify the app runs and cards sort correctly**

Open the Cards screen. Confirm:
- Your cards appear at the top of the list
- Cards you own are ordered by how many of your tasks they have (most first)
- Toggling filters (hide completed, time filter) does not reorder cards

**Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/hooks/useCardsFiltering.ts
git commit -m "feat: sort cards by current user ownership then task count"
```
