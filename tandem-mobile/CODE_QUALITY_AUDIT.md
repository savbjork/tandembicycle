# 🔍 Code Quality Audit — Tandem Mobile

**Date:** March 4, 2026  
**Scope:** Full `tandem-mobile/src/` codebase  
**Focus:** Sustainability, reusability, and best coding practices

---

## Executive Summary

The app has a **good foundation**: feature-based folder structure, a shared component library, Zustand stores, typed navigation, and branded types. However, several patterns have drifted during rapid feature development. The biggest sustainability risks are:

1. **Giant screen components** (CardsScreen alone is 769 lines)
2. **Duplicate UI patterns** that should be shared components
3. **Two competing type systems** (core models vs. FakeDataStore types)
4. **Direct mutation of a global mutable singleton** instead of using state management
5. **Duplicated logic** (date filtering, `toDateStringLocal`, `handleToggleDone`)

Below are all findings, grouped by category, with severity and recommended actions.

---

## 🔴 CRITICAL — Must Fix for Sustainability

### 1. Global Mutable Singleton as "State Management"

**Files:** Every screen file  
**Issue:** `FakeDataStore` is a mutable class singleton (`fakeData`) that every screen reads and writes to directly. Screens *also* duplicate its arrays into local `useState`, creating two sources of truth that easily fall out of sync.

```tsx
// Pattern repeated in every screen:
fakeData.tasks.unshift(newTask);         // mutate global
setTasks([newTask, ...tasks]);           // also set local state
```

**Why it matters:** When you move to real data (Firebase), you'll need to rewrite every screen. Bugs from stale local state are inevitable.

**Recommendation:**
- Create proper Zustand slices for `cards`, `tasks`, and `dropZoneItems`
- Screens should read from and dispatch actions to the store
- The store can hold mock data now and swap to Firebase later — zero screen changes needed

---

### 2. Two Competing Type Systems

**Files:** `src/core/models/` vs. `src/shared/data/FakeDataStore.ts`

| Aspect | `core/models/Task.ts` | `FakeDataStore.ts` |
|---|---|---|
| `id` type | `TaskId` (branded) | `string` |
| `owner` | `UserId` (branded) | `'Savannah' \| 'Kevin'` |
| `dueDate` | `Date \| null` | `string` |
| `card` reference | `HouseholdCardId` | `string` (card name) |

The `core/models/` types are well-designed with branded types, DTOs, and proper relationships. But **no screen actually uses them**. Every screen imports types from `FakeDataStore.ts` instead.

**Recommendation:**
- Migrate `FakeDataStore` to use `core/models/` types (or a simplified version of them)
- Remove duplicate type definitions from `FakeDataStore.ts`
- This makes the transition to real data seamless

---

### 3. CardsScreen.tsx is 769 Lines — Needs Decomposition

**File:** `src/features/cards/screens/CardsScreen.tsx`

This single file contains:
- The main CardsScreen component (28 state variables!)
- Balance meter widget
- Card list with inline task display
- Navigation row
- Filter bottom sheet
- Shuffle modal (options)
- Swipe mode full-screen modal
- AddCardModal component
- All business logic for filtering, shuffling, selection, etc.

**Recommendation:** Break into focused pieces:

| New File | What it contains |
|---|---|
| `BalanceMeter.tsx` | The balance bar with owner counts |
| `CardListItem.tsx` | Individual card row with inline tasks |
| `NavigationRow.tsx` | The Tasks / Inbox / Home quick-nav buttons |
| `CardFilterSheet.tsx` | The filter bottom sheet |
| `ShuffleModal.tsx` | Shuffle options modal |
| `SwipeModeScreen.tsx` | Full-screen card assignment swiper |
| `AddCardModal.tsx` | Already a separate component, just move to its own file |
| `useCardsFiltering.ts` | Hook for `isTaskInTimeFrame` and filter logic |
| `useCardShuffle.ts` | Hook for shuffle state and handlers |

---

## 🟡 HIGH — Important for Code Quality

### 4. Duplicate UI Patterns Needing Shared Components

These UI patterns are **copy-pasted almost identically** across multiple screens:

#### a) **Date Picker Modal** (duplicated in 2+ files)
`TasksScreen.tsx` lines 198-219 and `TaskDetailScreen.tsx` lines 127-149 have the exact same date picker modal pattern.

→ **Create:** `shared/components/ui/DatePickerSheet.tsx`

#### b) **Bottom Sheet Modal** (manually re-implemented despite having a `BottomSheet` component)
`CardsScreen.tsx` lines 482-551 and `InboxScreen.tsx` lines 229-271 manually implement the bottom-sheet pattern with `<Modal>` + `<TouchableOpacity>` backdrop instead of using the shared `<BottomSheet>` component.

→ **Fix:** Use the existing `<BottomSheet>` component everywhere

#### c) **Filter Chip / Segmented Control**
`CardsScreen.tsx` lines 415-427 (ownership filter), lines 431-448 (time filter), and lines 731-755 (owner selection) all implement the same "pill selector" pattern.

→ **Create:** `shared/components/ui/ChipGroup.tsx` or `SegmentedControl.tsx`

#### d) **Owner Avatar Badge**
The small colored circle with an initial (`card.owner.charAt(0)`) appears in `CardsScreen`, `SwipeableTaskRow`, and `CardDetailScreen`.

→ **Create:** `shared/components/ui/OwnerBadge.tsx`

#### e) **Empty State**
Custom empty states are defined inline in `TasksScreen` (lines 98-104), `CardDetailScreen` (lines 129-133), and `InboxScreen` (lines 100-104). There's already an `EmptyState` component exported but it's not being used.

→ **Fix:** Use the existing `<EmptyState>` component

#### f) **Section Header with Count Badge**
`InboxScreen` lines 82-88 and 110-116 duplicate a "label + icon + count badge" pattern.

→ **Create:** `shared/components/ui/SectionHeaderWithCount.tsx` (or extend existing `SectionHeader`)

#### g) **Form Field Label**
The pattern `<Text className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">` appears in `TasksScreen`, `TaskDetailScreen`, `CardDetailScreen`, `CardsScreen`, and `HomeOverviewScreen`.

→ **Create:** `shared/components/ui/FieldLabel.tsx`

---

### 5. Duplicated Business Logic

#### a) `toDateStringLocal()` — defined identically in TWO files
- `TasksScreen.tsx` line 12
- `TaskDetailScreen.tsx` line 10

→ **Move to:** `shared/utils/date.ts` (which already exists but doesn't have this function!)

#### b) `handleToggleDone()` — implemented identically in 3+ screens
- `CardsScreen.tsx` line 150
- `TasksScreen.tsx` line 39
- `CardDetailScreen.tsx` line 57

→ **Move to:** A Zustand action or a shared hook `useTaskActions()`

#### c) `isTaskInTimeFrame()` date filtering logic
- `CardsScreen.tsx` lines 157-190

→ **Move to:** `shared/utils/date.ts` as a reusable utility

#### d) `formatDate()` and `isOverdue()` in `SwipeableTaskRow.tsx`
- Lines 11-26 duplicate logic that exists in `shared/utils/date.ts`

→ **Use:** The existing utilities in `shared/utils/date.ts`

---

### 6. Hardcoded User Data

**Throughout the codebase:**
```tsx
const selectedPerson = 'Savannah';    // CardsScreen
const currentUser = 'Savannah';       // InboxScreen
const selectedPerson: Person = 'Savannah'; // TasksScreen
const partner = 'Kevin';              // InboxScreen
```

These should come from auth state / the store, not be hardcoded strings.

→ **Fix:** Create a `useCurrentUser()` hook that reads from `useAuthStore()`

---

## 🟢 MODERATE — Good Practice Improvements

### 7. Navigation Type Safety Gaps

- `TaskDetailScreen` uses `navigation: any` in its props (line 18)
- Several screens use `useNavigation()` without type parameters
- `CardsStackParamList` includes routes like `MyBoard`, `Inbox`, `Home` that aren't actually stack screens — they're tabs navigated via `navigation.navigate()`

→ **Fix:** Use proper typed navigation hooks everywhere

### 8. Missing Index Files for Feature Modules

`features/cards/`, `features/home/`, etc. have no `index.ts` barrel files. This means imports reach deep into the directory tree.

→ **Add:** barrel exports for each feature module

### 9. Unused / Dead Infrastructure Code

The following are well-architected but **completely unused**:
- `core/models/` — all models (Card, Task, Household, User, etc.)
- `core/repositories/` — all repository interfaces
- `infrastructure/firebase/` — converters, repositories, config
- `shared/utils/validation.ts` — Zod schemas
- `shared/utils/errors.ts` — error handling utilities
- `shared/types/branded.ts` — branded types
- `shared/types/enums.ts` — enums (CardCategory, TaskFrequency, etc.)
- `shared/components/ui/Card.tsx` — the generic Card component (screens define cards inline)
- `store/slices/householdStore.ts` — Zustand household store
- `store/slices/uiStore.ts` — Zustand UI store

This is technically fine as scaffolding, but it creates confusion about which types/patterns to use. The `FakeDataStore` types shadow the proper `core/models/` types.

→ **Decision needed:** Either wire up the existing infrastructure or remove it to reduce confusion

### 10. Console Logs in Production Code

`RootNavigator.tsx` has multiple `console.log` statements (lines 18-24, 28, 32) that should be removed or replaced with a proper logger.

### 11. Inconsistent Component Patterns

- `Card.tsx` (shared component) uses `bg-white` and `border-gray-100` (raw Tailwind) while every other component uses the theme tokens (`bg-surface`, `border-border`)
- `SignInScreen` builds its own button inline instead of using the shared `<Button>` component
- `HouseholdOverviewScreen` uses `getMockHousehold()` from `mockData.ts` while all other screens use `fakeData` singleton — two different mock data sources

### 12. Missing Error Boundaries

No error boundary components exist. If a screen throws during render, the entire app crashes.

→ **Create:** `shared/components/ErrorBoundary.tsx`

### 13. No Loading States

Screens render data immediately with no loading skeleton or spinner patterns. When real data is added, every screen will need loading state handling.

→ **Create:** `shared/components/ui/Skeleton.tsx` or `LoadingState.tsx`

---

## 📋 Prioritized Action Plan

### Phase 1: Foundation Fixes ✅ COMPLETED
1. ✅ ~~Create Zustand slices for `cards`, `tasks`, `dropZoneItems`~~ — Created `store/slices/dataStore.ts` with full CRUD + shuffle actions
2. ✅ ~~Unify type system~~ — Added `note` to `Card` interface; all screens now import from `FakeDataStore` types consistently
3. ✅ ~~Create `useCurrentUser()` hook~~ — Created `shared/hooks/useCurrentUser.ts`, removed all hardcoded `'Savannah'`/`'Kevin'` strings
4. ✅ ~~Move duplicated utilities to `shared/utils/`~~ — Moved `toDateStringLocal`, `isDateInTimeFrame`, `formatShortDate`, `isOverdue` to `shared/utils/date.ts`

### Phase 2: Extract Reusable Components (high impact)
5. ✅ `DatePickerSheet` — eliminate duplicated date picker modals
6. ✅ `ChipGroup` / `SegmentedControl` — reusable pill/chip selector
7. ✅ `OwnerBadge` — avatar circle with initial
8. ✅ `FieldLabel` — standardized form field label
9. ✅ Use existing `EmptyState` and `BottomSheet` components consistently

### Phase 3: Decompose Giant Screens
10. ✅ Break `CardsScreen.tsx` into 6-8 focused files
11. ✅ Extract `AddCardModal`, `ShuffleModal`, `SwipeModeScreen` into separate files
12. ✅ Create custom hooks for complex screen state (`useCardsFiltering`, `useCardShuffle`)

### Phase 4: Polish & Resilience
13. ✅ Add `ErrorBoundary` component
14. ✅ Add loading/skeleton states
15. ✅ Fix navigation type safety
16. ✅ Remove console.log statements
17. ✅ Add barrel exports for feature modules
18. ✅ Standardize `Card.tsx` to use theme tokens

---

## 📊 Metrics Summary

| Metric | Current | Target |
|---|---|---|
| Largest screen file | 769 lines | < 200 lines |
| Duplicated UI patterns | 7+ patterns | 0 |
| Duplicated business logic | 4+ functions | 0 |
| Hardcoded user strings | 6+ instances | 0 |
| Unused infrastructure files | ~15 files | Wired up or removed |
| Shared components actually used | ~8 of 18 | 18 of 18 |
| Type systems in use | 2 (competing) | 1 (unified) |
