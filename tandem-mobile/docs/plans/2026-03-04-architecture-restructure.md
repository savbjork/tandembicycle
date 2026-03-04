# Architecture Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename feature folders to be semantically accurate, delete unused scaffolding, and rename navigation types to match actual screen names — zero behavior change.

**Architecture:** Pure file moves + renames. The only files that change their content are import statements and the navigation types file. All screen logic, components, and data layer are untouched.

**Tech Stack:** React Native / Expo, TypeScript, React Navigation, Zustand

**TypeScript check command:** `cd tandem-mobile && npx tsc --noEmit`

---

## Task 1: Delete dead code — store slices

**Files:**
- Delete: `src/store/slices/householdStore.ts`
- Delete: `src/store/slices/uiStore.ts`
- Modify: `src/store/index.ts`

**Step 1: Delete the two unused store slices**

```bash
rm tandem-mobile/src/store/slices/householdStore.ts
rm tandem-mobile/src/store/slices/uiStore.ts
```

**Step 2: Remove their exports from store/index.ts**

Open `src/store/index.ts`. Replace the full file with:

```typescript
export { useAuthStore } from './slices/authStore';
export { useDataStore } from './slices/dataStore';
```

**Step 3: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors related to householdStore or uiStore.

**Step 4: Commit**

```bash
git add tandem-mobile/src/store/index.ts tandem-mobile/src/store/slices/
git commit -m "refactor: remove unused householdStore and uiStore slices"
```

---

## Task 2: Delete dead code — shared types and utils

**Files:**
- Delete: `src/shared/types/branded.ts`
- Delete: `src/shared/types/enums.ts`
- Delete: `src/shared/types/index.ts`
- Delete: `src/shared/utils/validation.ts`
- Delete: `src/shared/utils/errors.ts`
- Modify: `src/shared/utils/index.ts`

**Step 1: Delete the unused type and util files**

```bash
rm tandem-mobile/src/shared/types/branded.ts
rm tandem-mobile/src/shared/types/enums.ts
rm tandem-mobile/src/shared/types/index.ts
rm tandem-mobile/src/shared/utils/validation.ts
rm tandem-mobile/src/shared/utils/errors.ts
```

**Step 2: Update shared/utils/index.ts to remove dead re-exports**

Open `src/shared/utils/index.ts`. Replace the full file with:

```typescript
export * from './date';
```

**Step 3: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors.

**Step 4: Commit**

```bash
git add tandem-mobile/src/shared/types/ tandem-mobile/src/shared/utils/
git commit -m "refactor: remove unused shared types and utility scaffolding"
```

---

## Task 3: Delete dead code — core, infrastructure, and dead nav stacks

**Files:**
- Delete: `src/core/` (entire directory)
- Delete: `src/infrastructure/` (entire directory)
- Delete: `src/app/navigation/stacks/HomeStackNavigator.tsx`
- Delete: `src/app/navigation/stacks/HouseholdStackNavigator.tsx`
- Delete: `src/features/household/` (entire directory)
- Delete: `src/shared/constants/mockData.ts`

**Step 1: Delete all the dead scaffolding**

```bash
rm -rf tandem-mobile/src/core
rm -rf tandem-mobile/src/infrastructure
rm tandem-mobile/src/app/navigation/stacks/HomeStackNavigator.tsx
rm tandem-mobile/src/app/navigation/stacks/HouseholdStackNavigator.tsx
rm -rf tandem-mobile/src/features/household
rm tandem-mobile/src/shared/constants/mockData.ts
```

**Step 2: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors. (None of these files were imported by active code.)

**Step 3: Commit**

```bash
git add -A tandem-mobile/src/core tandem-mobile/src/infrastructure \
  tandem-mobile/src/app/navigation/stacks/ \
  tandem-mobile/src/features/household \
  tandem-mobile/src/shared/constants/
git commit -m "refactor: delete unused core, infrastructure, and dead scaffolding"
```

---

## Task 4: Move SwipeableTaskRow into ui/

Three files import `TaskRow` from `@shared/components/SwipeableTaskRow`:
- `src/features/home/screens/TasksScreen.tsx`
- `src/features/cards/screens/CardDetailScreen.tsx`
- `src/features/cards/components/CardListItem.tsx`

**Files:**
- Move: `src/shared/components/SwipeableTaskRow.tsx` → `src/shared/components/ui/SwipeableTaskRow.tsx`
- Modify: `src/shared/components/ui/index.ts` (add export)
- Modify: 3 files with import `@shared/components/SwipeableTaskRow`

**Step 1: Move the file**

```bash
mv tandem-mobile/src/shared/components/SwipeableTaskRow.tsx \
   tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx
```

**Step 2: Add export to ui/index.ts**

Open `src/shared/components/ui/index.ts` and add this line with the other exports:

```typescript
export { TaskRow, SwipeableTaskRow } from './SwipeableTaskRow';
```

**Step 3: Update imports in the 3 files that reference the old path**

In each of these files, change:
```typescript
import { TaskRow } from '@shared/components/SwipeableTaskRow';
```
to:
```typescript
import { TaskRow } from '@shared/components/ui/SwipeableTaskRow';
```

Files to update:
- `src/features/home/screens/TasksScreen.tsx`
- `src/features/cards/screens/CardDetailScreen.tsx`
- `src/features/cards/components/CardListItem.tsx`

**Step 4: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors.

**Step 5: Commit**

```bash
git add tandem-mobile/src/shared/components/ \
  tandem-mobile/src/features/home/screens/TasksScreen.tsx \
  tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx \
  tandem-mobile/src/features/cards/components/CardListItem.tsx
git commit -m "refactor: move SwipeableTaskRow into shared/components/ui/"
```

---

## Task 5: Rename features/home/ → tasks/ and split out inbox/

The `home/` folder has 3 screens:
- `TasksScreen.tsx` → goes to `features/tasks/`
- `TaskDetailScreen.tsx` → goes to `features/tasks/`
- `InboxScreen.tsx` → goes to `features/inbox/`

**Files:**
- Create: `src/features/tasks/screens/TasksScreen.tsx` (moved)
- Create: `src/features/tasks/screens/TaskDetailScreen.tsx` (moved)
- Create: `src/features/tasks/index.ts` (new barrel)
- Create: `src/features/inbox/screens/InboxScreen.tsx` (moved)
- Create: `src/features/inbox/index.ts` (new barrel)
- Delete: `src/features/home/` (entire directory)

**Step 1: Create the new directory structure and move files**

```bash
mkdir -p tandem-mobile/src/features/tasks/screens
mkdir -p tandem-mobile/src/features/inbox/screens

mv tandem-mobile/src/features/home/screens/TasksScreen.tsx \
   tandem-mobile/src/features/tasks/screens/TasksScreen.tsx

mv tandem-mobile/src/features/home/screens/TaskDetailScreen.tsx \
   tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx

mv tandem-mobile/src/features/home/screens/InboxScreen.tsx \
   tandem-mobile/src/features/inbox/screens/InboxScreen.tsx

rm -rf tandem-mobile/src/features/home
```

**Step 2: Create tasks/index.ts barrel**

Create `src/features/tasks/index.ts`:

```typescript
export { TasksScreen } from './screens/TasksScreen';
export { TaskDetailScreen } from './screens/TaskDetailScreen';
```

**Step 3: Create inbox/index.ts barrel**

Create `src/features/inbox/index.ts`:

```typescript
export { InboxScreen } from './screens/InboxScreen';
```

**Step 4: Run TypeScript check (expect errors — fix them in next step)**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: errors about `@features/home/...` imports not found. This is expected — fix in next step.

**Step 5: Update all imports that referenced the old home/ paths**

Files to search for old imports: run this to find them:
```bash
grep -r "features/home\b" tandem-mobile/src --include="*.ts" --include="*.tsx" -l
```

Update each file found:
- `@features/home/screens/TasksScreen` → `@features/tasks/screens/TasksScreen`
- `@features/home/screens/TaskDetailScreen` → `@features/tasks/screens/TaskDetailScreen`
- `@features/home/screens/InboxScreen` → `@features/inbox/screens/InboxScreen`

**Step 6: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors.

**Step 7: Commit**

```bash
git add -A tandem-mobile/src/features/home \
  tandem-mobile/src/features/tasks \
  tandem-mobile/src/features/inbox
git commit -m "refactor: split features/home into features/tasks and features/inbox"
```

---

## Task 6: Rename features/home-hub/ → profile/, rename HomeOverviewScreen → ProfileScreen

**Files:**
- Create: `src/features/profile/screens/ProfileScreen.tsx` (moved + renamed)
- Create: `src/features/profile/index.ts` (new barrel)
- Delete: `src/features/home-hub/` (entire directory)

**Step 1: Create directory and move file**

```bash
mkdir -p tandem-mobile/src/features/profile/screens

mv tandem-mobile/src/features/home-hub/screens/HomeOverviewScreen.tsx \
   tandem-mobile/src/features/profile/screens/ProfileScreen.tsx

rm -rf tandem-mobile/src/features/home-hub
```

**Step 2: Rename the component inside the file**

Open `src/features/profile/screens/ProfileScreen.tsx`. Find:
```typescript
export const HomeOverviewScreen: React.FC = () => {
```
Replace with:
```typescript
export const ProfileScreen: React.FC = () => {
```

**Step 3: Create profile/index.ts barrel**

Create `src/features/profile/index.ts`:

```typescript
export { ProfileScreen } from './screens/ProfileScreen';
```

**Step 4: Find and update all imports of HomeOverviewScreen**

```bash
grep -r "HomeOverviewScreen\|home-hub" tandem-mobile/src --include="*.ts" --include="*.tsx" -l
```

For each file found, update:
- `@features/home-hub/screens/HomeOverviewScreen` → `@features/profile/screens/ProfileScreen`
- `HomeOverviewScreen` (component reference) → `ProfileScreen`

**Step 5: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors.

**Step 6: Commit**

```bash
git add -A tandem-mobile/src/features/home-hub \
  tandem-mobile/src/features/profile
git commit -m "refactor: rename home-hub to profile, HomeOverviewScreen to ProfileScreen"
```

---

## Task 7: Rename navigation types and CardsStackNavigator → MainStackNavigator

**Files:**
- Modify: `src/app/navigation/types.ts`
- Rename + Modify: `src/app/navigation/stacks/CardsStackNavigator.tsx` → `MainStackNavigator.tsx`
- Modify: `src/app/navigation/MainNavigator.tsx` (update import)
- Modify: `src/features/cards/screens/CardsScreen.tsx` (update type reference + route names)

**Step 1: Update navigation/types.ts**

Open `src/app/navigation/types.ts`. Replace `CardsStackParamList` with:

```typescript
// Main Stack Navigator (primary app stack, accessed from RosterTab)
export type MainStackParamList = {
  CardsList: undefined;
  CardDetail: { cardName: string };
  Tasks: undefined;
  Inbox: undefined;
  Profile: undefined;
};
```

Remove the old `CardsStackParamList` entirely. Also update `MainTabParamList` if it references `CardsStackParamList`:

```typescript
export type MainTabParamList = {
  RosterTab: NavigatorScreenParams<MainStackParamList>;
  InboxTab: undefined;
  HomeTab: undefined;
};
```

**Step 2: Rename and update CardsStackNavigator.tsx → MainStackNavigator.tsx**

```bash
mv tandem-mobile/src/app/navigation/stacks/CardsStackNavigator.tsx \
   tandem-mobile/src/app/navigation/stacks/MainStackNavigator.tsx
```

Open `src/app/navigation/stacks/MainStackNavigator.tsx` and make these changes:

1. Update import: `CardsStackParamList` → `MainStackParamList`
2. Rename: `const Stack = createNativeStackNavigator<CardsStackParamList>()` → `createNativeStackNavigator<MainStackParamList>()`
3. Rename: `export const CardsStackNavigator` → `export const MainStackNavigator`
4. Update screen imports to use new feature paths:
   - `@features/home/screens/TasksScreen` → `@features/tasks/screens/TasksScreen`
   - `@features/home/screens/InboxScreen` → `@features/inbox/screens/InboxScreen`
   - `@features/home-hub/screens/HomeOverviewScreen` → `@features/profile/screens/ProfileScreen`
5. Update route names:
   - `name="MyBoard"` → `name="Tasks"`
   - `name="Home"` → `name="Profile"`
   - Update `component={HomeOverviewScreen}` → `component={ProfileScreen}`

Full updated file:

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { CardsScreen } from '@features/cards/screens/CardsScreen';
import { CardDetailScreen } from '@features/cards/screens/CardDetailScreen';
import { TasksScreen } from '@features/tasks/screens/TasksScreen';
import { InboxScreen } from '@features/inbox/screens/InboxScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="CardsList"
                component={CardsScreen}
            />
            <Stack.Screen
                name="CardDetail"
                component={CardDetailScreen}
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen
                name="Tasks"
                component={TasksScreen}
            />
            <Stack.Screen
                name="Inbox"
                component={InboxScreen}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Stack.Navigator>
    );
};
```

**Step 3: Update MainNavigator.tsx**

Open `src/app/navigation/MainNavigator.tsx`. Update:
- Import: `CardsStackNavigator` → `MainStackNavigator`
- Import path: `./stacks/CardsStackNavigator` → `./stacks/MainStackNavigator`
- Usage: `component={CardsStackNavigator}` → `component={MainStackNavigator}`
- Import for `InboxScreen`: update to `@features/inbox/screens/InboxScreen`
- Import for `HomeOverviewScreen`: update to `@features/profile/screens/ProfileScreen` and rename usage to `ProfileScreen`

**Step 4: Update CardsScreen.tsx navigation type and route names**

Open `src/features/cards/screens/CardsScreen.tsx`.

Find:
```typescript
import { CardsStackParamList, MainTabParamList } from '@app/navigation/types';
```
Replace with:
```typescript
import { MainStackParamList, MainTabParamList } from '@app/navigation/types';
```

Find:
```typescript
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CardsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;
```
Replace with:
```typescript
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;
```

Find and update the three navigate calls:
```typescript
onNavigateTasks={() => navigation.navigate('MyBoard')}
onNavigateInbox={() => navigation.navigate('Inbox')}
onNavigateHome={() => navigation.navigate('Home')}
```
Replace with:
```typescript
onNavigateTasks={() => navigation.navigate('Tasks')}
onNavigateInbox={() => navigation.navigate('Inbox')}
onNavigateHome={() => navigation.navigate('Profile')}
```

**Step 5: Update TasksScreen.tsx navigation type**

Open `src/features/tasks/screens/TasksScreen.tsx`.

Find:
```typescript
import type { CardsStackParamList } from '@app/navigation/types';
...
const navigation = useNavigation<NativeStackNavigationProp<CardsStackParamList>>();
```
Replace with:
```typescript
import type { MainStackParamList } from '@app/navigation/types';
...
const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
```

**Step 6: Check for any remaining CardsStackParamList references**

```bash
grep -r "CardsStackParamList\|CardsStackNavigator\|MyBoard\b\|navigate.*'Home'" \
  tandem-mobile/src --include="*.ts" --include="*.tsx"
```
Expected: no results.

**Step 7: Run TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: no errors.

**Step 8: Commit**

```bash
git add -A tandem-mobile/src/app/navigation/ \
  tandem-mobile/src/features/cards/screens/CardsScreen.tsx \
  tandem-mobile/src/features/tasks/screens/TasksScreen.tsx
git commit -m "refactor: rename CardsStack to MainStack, update navigation route names"
```

---

## Task 8: Final verification

**Step 1: Full TypeScript check**

```bash
cd tandem-mobile && npx tsc --noEmit
```
Expected: 0 errors.

**Step 2: Verify the new folder structure looks right**

```bash
find tandem-mobile/src/features -type d | sort
```

Expected output:
```
tandem-mobile/src/features
tandem-mobile/src/features/auth
tandem-mobile/src/features/auth/screens
tandem-mobile/src/features/cards
tandem-mobile/src/features/cards/components
tandem-mobile/src/features/cards/hooks
tandem-mobile/src/features/cards/screens
tandem-mobile/src/features/inbox
tandem-mobile/src/features/inbox/screens
tandem-mobile/src/features/profile
tandem-mobile/src/features/profile/screens
tandem-mobile/src/features/tasks
tandem-mobile/src/features/tasks/screens
```

**Step 3: Verify no dead directories remain**

```bash
find tandem-mobile/src -type d | grep -E "home|home-hub|core|infrastructure|household" | grep -v node_modules
```
Expected: no output.

**Step 4: Commit if any cleanup needed, otherwise done**

```bash
git log --oneline -8
```
Review the commit history looks clean and logical.
