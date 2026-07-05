# Color Palette Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the duplicated color system (tailwind.config.js + colors.ts) with a single canonical source (`tokens.js` + `tokens.d.ts`), and replace all hardcoded color classes/values in components with semantic tokens.

**Architecture:** `tokens.js` is the canonical plain-JS color source. `tokens.d.ts` provides TypeScript types so `colors.ts` can use a typed `import`. `tailwind.config.js` `require`s `tokens.js` directly. Components use only semantic token classes and `COLORS.*` values.

**Tech Stack:** React Native, NativeWind (Tailwind CSS v3), TypeScript

---

## Chunk 1: Token infrastructure

### Task 1: Create `tokens.js` — canonical color source

**Files:**
- Create: `tandem-mobile/src/shared/constants/tokens.js`

- [ ] Create the file with all color tokens. This is the single source of truth — every color value in the app lives here:

```js
// tandem-mobile/src/shared/constants/tokens.js
module.exports = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  surface: {
    DEFAULT: '#ffffff',
    muted: '#f9fafb',
    dim: '#fafafa',
    hover: '#f3f4f6',
  },
  border: {
    DEFAULT: '#e5e7eb',
    light: '#f0f0f0',
    muted: '#f3f4f6',
    strong: '#d1d5db',
  },
  text: {
    DEFAULT: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af',
    light: '#374151',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  neutral: {
    500: '#6b7280',
  },
  info: {
    100: '#dbeafe',
    700: '#1d4ed8',
  },
};
```

- [ ] Commit:

```bash
git add tandem-mobile/src/shared/constants/tokens.js
git commit -m "feat: add tokens.js as canonical color source"
```

---

### Task 2: Create `tokens.d.ts` — TypeScript declarations

**Files:**
- Create: `tandem-mobile/src/shared/constants/tokens.d.ts`

- [ ] Create the declaration file. This is what lets `colors.ts` use `import tokens from './tokens'` with full type safety and numeric key access:

```ts
// tandem-mobile/src/shared/constants/tokens.d.ts
declare const tokens: {
  primary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  secondary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  surface: { DEFAULT: string; muted: string; dim: string; hover: string };
  border: { DEFAULT: string; light: string; muted: string; strong: string };
  text: { DEFAULT: string; secondary: string; muted: string; light: string };
  success: { 50: string; 100: string; 600: string; 700: string };
  warning: { 50: string; 100: string; 500: string; 600: string; 700: string; 800: string };
  neutral: { 500: string };
  info: { 100: string; 700: string };
};

export = tokens;
```

- [ ] Commit:

```bash
git add tandem-mobile/src/shared/constants/tokens.d.ts
git commit -m "feat: add tokens.d.ts TypeScript declarations"
```

---

### Task 3: Update `tailwind.config.js` to use tokens

**Files:**
- Modify: `tandem-mobile/tailwind.config.js`

- [ ] Read the current file first to understand what's there.

- [ ] Replace the entire file contents:

```js
// tandem-mobile/tailwind.config.js
const tokens = require('./src/shared/constants/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    'bg-primary-50',
    'bg-primary-600',
    'border-primary-200',
    'bg-secondary-50',
    'bg-secondary-600',
    'border-secondary-200',
    'bg-neutral-500',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        nanum: ['NanumMyeongjo-Regular'],
      },
      colors: tokens,
    },
  },
  plugins: [],
};
```

Note: `bg-gray-500` in the old safelist is replaced with `bg-neutral-500`.

- [ ] Commit:

```bash
git add tandem-mobile/tailwind.config.js
git commit -m "refactor: tailwind.config.js reads colors from tokens.js"
```

---

### Task 4: Update `colors.ts` to import from tokens

**Files:**
- Modify: `tandem-mobile/src/shared/constants/colors.ts`

- [ ] Read the current file first.

- [ ] Replace the entire file:

```ts
// tandem-mobile/src/shared/constants/colors.ts
/**
 * Design tokens for JS-only contexts (e.g. Ionicons color prop, StyleSheet values)
 * where NativeWind className cannot be used.
 *
 * Source of truth: tokens.js (consumed here and by tailwind.config.js)
 */
import tokens from './tokens';

export const COLORS = {
  ...tokens,
  white: '#ffffff',
} as const;
```

- [ ] Commit:

```bash
git add tandem-mobile/src/shared/constants/colors.ts
git commit -m "refactor: colors.ts imports from tokens.js via tokens.d.ts"
```

---

## Chunk 2: Component color cleanup

### Task 5: Auth screens — SignInScreen and SignUpScreen

**Files:**
- Modify: `tandem-mobile/src/features/auth/screens/SignInScreen.tsx`
- Modify: `tandem-mobile/src/features/auth/screens/SignUpScreen.tsx`

- [ ] In **SignInScreen.tsx**, add the COLORS import and make two replacements:

Add import at top (after existing imports):
```ts
import { COLORS } from '@shared/constants/colors';
```

Replace:
```tsx
<Ionicons name="chevron-back" size={28} color="#374151" />
```
With:
```tsx
<Ionicons name="chevron-back" size={28} color={COLORS.text.light} />
```

Replace:
```tsx
{error && <Text className="text-sm text-red-600 mb-4">{error}</Text>}
```
With:
```tsx
{error && <Text className="text-sm text-primary-600 mb-4">{error}</Text>}
```

- [ ] Make the same two changes in **SignUpScreen.tsx** (identical pattern — `#374151` → `COLORS.text.light`, `text-red-600` → `text-primary-600`). Also add the COLORS import.

- [ ] Commit:

```bash
git add tandem-mobile/src/features/auth/screens/SignInScreen.tsx tandem-mobile/src/features/auth/screens/SignUpScreen.tsx
git commit -m "refactor: replace hardcoded colors in auth screens"
```

---

### Task 6: CardDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

- [ ] Read the file first.

- [ ] Make these replacements:

Replace the `FREQUENCY_ACTIVE_STYLE` map (the `as-needed` entry):
```ts
const FREQUENCY_ACTIVE_STYLE: Record<CardFrequency, string> = {
  daily: 'bg-primary-600',
  weekly: 'bg-secondary-600',
  'as-needed': 'bg-gray-500',
};
```
With:
```ts
const FREQUENCY_ACTIVE_STYLE: Record<CardFrequency, string> = {
  daily: 'bg-primary-600',
  weekly: 'bg-secondary-600',
  'as-needed': 'bg-neutral-500',
};
```

Replace the "not owner" banner:
```tsx
<View className="bg-yellow-50 rounded-xl p-4 mb-4 flex-row items-center gap-3 border border-yellow-100">
  <Ionicons name="lock-closed" size={18} color="#ca8a04" />
  <Text className="text-sm text-yellow-800 flex-1">
```
With:
```tsx
<View className="bg-warning-50 rounded-xl p-4 mb-4 flex-row items-center gap-3 border border-warning-100">
  <Ionicons name="lock-closed" size={18} color={COLORS.warning[600]} />
  <Text className="text-sm text-warning-800 flex-1">
```

Replace the Delete button row:
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-red-50 rounded-xl border border-red-100"
```
With:
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-50 rounded-xl border border-primary-100"
```

Replace:
```tsx
<Ionicons name="trash-outline" size={18} color="#dc2626" />
<Text className="text-sm font-bold text-red-600">Delete</Text>
```
With:
```tsx
<Ionicons name="trash-outline" size={18} color={COLORS.primary[600]} />
<Text className="text-sm font-bold text-primary-600">Delete</Text>
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "refactor: replace hardcoded colors in CardDetailScreen"
```

---

### Task 7: TaskDetailScreen

**Files:**
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

- [ ] Read the file first to confirm the exact strings.

- [ ] Make the same replacements as CardDetailScreen (same patterns appear):
  - `bg-yellow-50 border-yellow-100` → `bg-warning-50 border-warning-100`
  - `color="#ca8a04"` → `color={COLORS.warning[600]}`
  - `text-yellow-800` → `text-warning-800`
  - `bg-red-50 border-red-100` → `bg-primary-50 border-primary-100`
  - `color="#dc2626"` → `color={COLORS.primary[600]}`
  - `text-red-600` → `text-primary-600`

Add `COLORS` import if not already present:
```ts
import { COLORS } from '@shared/constants/colors';
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "refactor: replace hardcoded colors in TaskDetailScreen"
```

---

### Task 8: ShuffleModal and ProfileScreen

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/ShuffleModal.tsx`
- Modify: `tandem-mobile/src/features/profile/screens/ProfileScreen.tsx`

- [ ] In **ShuffleModal.tsx**, replace the fresh-start button row:

```tsx
className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 flex-row items-center gap-4 shadow-sm"
```
→
```tsx
className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100 flex-row items-center gap-4 shadow-sm"
```

```tsx
<View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
  <Ionicons name="trash" size={20} color="#dc2626" />
```
→
```tsx
<View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
  <Ionicons name="trash" size={20} color={COLORS.primary[600]} />
```

```tsx
<Text className="text-base font-bold text-red-600">Restart with defaults</Text>
```
→
```tsx
<Text className="text-base font-bold text-primary-600">Restart with defaults</Text>
```

- [ ] In **ProfileScreen.tsx**, replace the "Leave Household" button:

```tsx
className="flex-row items-center justify-center gap-2 py-3 border border-red-100 bg-red-50 rounded-xl"
```
→
```tsx
className="flex-row items-center justify-center gap-2 py-3 border border-primary-100 bg-primary-50 rounded-xl"
```

```tsx
<Ionicons name="exit-outline" size={18} color="#dc2626" />
<Text className="text-sm text-red-600 font-bold">Leave Household</Text>
```
→
```tsx
<Ionicons name="exit-outline" size={18} color={COLORS.primary[600]} />
<Text className="text-sm text-primary-600 font-bold">Leave Household</Text>
```

- [ ] Commit:

```bash
git add tandem-mobile/src/features/cards/components/ShuffleModal.tsx tandem-mobile/src/features/profile/screens/ProfileScreen.tsx
git commit -m "refactor: replace hardcoded colors in ShuffleModal and ProfileScreen"
```

---

### Task 9: Shared UI components

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/DeleteButton.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/Divider.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/Badge.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/EmptyState.tsx`
- Modify: `tandem-mobile/src/shared/components/ErrorBoundary.tsx`

- [ ] **DeleteButton.tsx** — replace:
```tsx
className={`bg-surface rounded-xl p-4 border border-red-100 items-center active:bg-red-50 ${className ?? ''}`}
```
→
```tsx
className={`bg-surface rounded-xl p-4 border border-primary-100 items-center active:bg-primary-50 ${className ?? ''}`}
```
```tsx
<Text className="text-base font-semibold text-red-500">{title}</Text>
```
→
```tsx
<Text className="text-base font-semibold text-primary-500">{title}</Text>
```

- [ ] **Divider.tsx** — replace both instances of `bg-gray-200` with `bg-border`:
```tsx
return <View className={`w-px bg-gray-200 ${className || ''}`} />;
```
→
```tsx
return <View className={`w-px bg-border ${className || ''}`} />;
```
```tsx
return <View className={`h-px bg-gray-200 my-4 ${className || ''}`} />;
```
→
```tsx
return <View className={`h-px bg-border my-4 ${className || ''}`} />;
```

- [ ] **SwipeableTaskRow.tsx** — replace all overdue color references. There are four locations:

`text-red-500` (overdue date, compact variant) → `text-primary-500`
`text-red-600` (overdue task name, board variant) → `text-primary-600`
`text-red-500` (overdue date, board variant) → `text-primary-500`
`border-red-200` (overdue board card border) → `border-primary-200`
`text-red-600` (overdue task name, list variant) → `text-primary-600`

- [ ] **Badge.tsx** — replace raw Tailwind color classes with tokens:

```ts
case 'success':
  return 'bg-green-100 text-green-700';
case 'warning':
  return 'bg-amber-100 text-amber-700';
case 'error':
  return 'bg-red-100 text-red-700';
case 'info':
  return 'bg-blue-100 text-blue-700';
default:
  return 'bg-gray-100 text-gray-700';
```
→
```ts
case 'success':
  return 'bg-success-100 text-success-700';
case 'warning':
  return 'bg-warning-100 text-warning-700';
case 'error':
  return 'bg-primary-100 text-primary-700';
case 'info':
  return 'bg-info-100 text-info-700';
default:
  return 'bg-surface-hover text-text-secondary';
```

- [ ] **EmptyState.tsx** — replace:
```tsx
<Text className="text-xl font-semibold text-gray-900 text-center mb-2">{title}</Text>
{description && <Text className="text-gray-500 text-center mb-6">{description}</Text>}
```
→
```tsx
<Text className="text-xl font-semibold text-text text-center mb-2">{title}</Text>
{description && <Text className="text-text-secondary text-center mb-6">{description}</Text>}
```

- [ ] **ErrorBoundary.tsx** — replace:
```ts
shadowColor: '#000',
```
→
```ts
shadowColor: COLORS.text.DEFAULT,
```

- [ ] Commit:

```bash
git add \
  tandem-mobile/src/shared/components/ui/DeleteButton.tsx \
  tandem-mobile/src/shared/components/ui/Divider.tsx \
  tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx \
  tandem-mobile/src/shared/components/ui/Badge.tsx \
  tandem-mobile/src/shared/components/ui/EmptyState.tsx \
  tandem-mobile/src/shared/components/ErrorBoundary.tsx
git commit -m "refactor: replace hardcoded colors in shared UI components"
```
