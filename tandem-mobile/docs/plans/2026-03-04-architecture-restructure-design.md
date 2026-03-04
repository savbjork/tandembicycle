# Architecture Restructure Design
**Date:** 2026-03-04
**Branch:** taskScreen
**Scope:** File/folder structure, dead code removal, navigation type cleanup

---

## Goals

- Feature folders have semantically accurate names
- Dead/unused scaffolding is removed to eliminate confusion about which patterns to use
- Navigation types reflect actual screen names, not which stack they were historically placed in
- Zero behavior change — this is a pure structural refactor

---

## Section 1: Feature Folder Renames

| Before | After | Notes |
|---|---|---|
| `features/home/screens/TasksScreen.tsx` | `features/tasks/screens/TasksScreen.tsx` | |
| `features/home/screens/TaskDetailScreen.tsx` | `features/tasks/screens/TaskDetailScreen.tsx` | |
| `features/home/screens/InboxScreen.tsx` | `features/inbox/screens/InboxScreen.tsx` | Inbox is its own feature |
| `features/home/index.ts` | `features/tasks/index.ts` + `features/inbox/index.ts` | Split barrel exports |
| `features/home-hub/screens/HomeOverviewScreen.tsx` | `features/profile/screens/ProfileScreen.tsx` | Rename file and component |
| `features/home-hub/index.ts` | `features/profile/index.ts` | |
| `features/household/` | DELETE | Not wired into any navigation |

**Result:**
```
features/
  auth/
  cards/
  tasks/
  inbox/
  profile/
```

---

## Section 2: Dead Code Removal

All of the following are unused — no imports reference them:

```
src/core/                                   (entire directory)
src/infrastructure/                         (entire directory)
src/store/slices/householdStore.ts
src/store/slices/uiStore.ts
src/shared/types/branded.ts
src/shared/types/enums.ts
src/shared/types/index.ts
src/shared/utils/validation.ts
src/shared/utils/errors.ts
src/shared/constants/mockData.ts
src/app/navigation/stacks/HomeStackNavigator.tsx
src/app/navigation/stacks/HouseholdStackNavigator.tsx
```

Also move:
- `shared/components/SwipeableTaskRow.tsx` → `shared/components/ui/SwipeableTaskRow.tsx`

---

## Section 3: Navigation Type Cleanup

Rename `CardsStackParamList` → `MainStackParamList` and its route names:

| Before | After |
|---|---|
| `CardsStackParamList` | `MainStackParamList` |
| route `MyBoard` | route `Tasks` |
| route `Home` | route `Profile` |
| `CardsStackNavigator` | `MainStackNavigator` |

Update all `navigation.navigate('MyBoard')` → `navigation.navigate('Tasks')` etc.

Update `MainNavigator.tsx` to import from `MainStackNavigator` and the new feature paths.

---

## What Does NOT Change

- All screen logic and UI — zero changes to component internals
- `FakeDataStore` and `dataStore.ts` — data layer untouched
- `shared/components/ui/` — all shared components stay
- `shared/hooks/`, `shared/utils/date.ts`, `shared/constants/colors.ts` — stay
- `store/slices/authStore.ts`, `store/slices/dataStore.ts` — stay
- `app/navigation/stacks/CardsStackNavigator.tsx` — renamed to `MainStackNavigator.tsx`

---

## UI Fixes (Follow-up, not in this plan)

To be addressed after the structural refactor:
1. Text input fields look inconsistent
2. Keyboard hides notes field in CardDetailScreen
3. Top margin too large on CardDetailScreen and TaskDetailScreen
4. Bottom sheet too small when keyboard is open (add task/card/inbox forms)
