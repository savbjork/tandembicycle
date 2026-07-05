# Jewel Tone Palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current red/fuchsia color palette with a 4-hue jewel tone system where each color carries a fixed semantic role: teal (app shell), cranberry (frequency), plum (people), evergreen (task actions).

**Architecture:** Remap `primary` → teal and `secondary` → plum in `tokens.js` so most components automatically pick up the new colors without code changes. Add `cranberry` and `evergreen` as new named tokens. Add an `error` red token so validation/danger states are no longer tied to the brand color. Then update a targeted set of components where the semantic role changes (frequency chips, checkboxes, error states, frequency selector).

**Tech Stack:** React Native + Expo, NativeWind (Tailwind), tokens in `tokens.js` / `tokens.d.ts`, `tailwind.config.js`

> ⚠️ **Task 1 is a blocking prerequisite.** All other tasks depend on the new token names (`error`, `cranberry`, `evergreen`) and the updated safelist being in place. Complete Task 1 and rebuild before proceeding.

---

## Color System Reference

| Role | Token name | Base hex | Used for |
|------|-----------|----------|---------|
| App shell | `primary` (remapped) | `#0F4C5C` | Buttons, add button, active tab, filter dot |
| People | `secondary` (remapped) | `#5C3D7A` | Owner badges, balance meter partner 2 |
| Frequency | `cranberry` (new) | `#8B1A2F` | Frequency chips/dots — daily=600, weekly=500, as-needed=300 |
| Task actions | `evergreen` (new) | `#1B4D3E` | Checkboxes (checked state), task completion |
| Errors/danger | `error` (new) | `#dc2626` | Input validation errors, delete buttons, overdue text |

---

## File Map

| File | Change type | What changes |
|------|------------|--------------|
| `src/shared/constants/tokens.js` | Modify | Remap primary→teal, secondary→plum; add cranberry, evergreen, error scales |
| `src/shared/constants/tokens.d.ts` | Modify | Add type defs for cranberry, evergreen, error |
| `tailwind.config.js` | Modify | Add cranberry + evergreen classes to safelist |
| `src/shared/components/ui/Checkbox.tsx` | Modify | Checked state: primary → evergreen |
| `src/shared/components/ui/Input.tsx` | Modify | Error border/text: primary-500 → error-500 |
| `src/shared/components/ui/DeleteButton.tsx` | Modify | Border/text: primary → error |
| `src/shared/components/ui/Button.tsx` | Modify | outline/ghost icon color: primary → teal (auto, but COLORS ref needs update) |
| `src/shared/components/ui/SwipeableTaskRow.tsx` | Modify | Overdue states: primary → error; owner badge remains primary/secondary (auto) |
| `src/features/cards/components/CardListItem.tsx` | Modify | Remove bg-based frequency colors; add cranberry frequency chip |
| `src/features/cards/screens/CardDetailScreen.tsx` | Modify | FrequencySelector active style: use cranberry shades per frequency |
| `src/features/cards/components/ShuffleModal.tsx` | Modify | Icon bg/colors: primary/secondary → teal/plum; "Restart" danger section → error |
| `src/features/cards/components/SwipeModeScreen.tsx` | Modify | Partner assignment buttons: alternating primary/secondary → teal/plum (auto, confirm visually) |
| `src/features/tasks/screens/TaskDetailScreen.tsx` | Modify | Done state: primary → evergreen; delete: primary → error |
| `src/features/auth/screens/SignInScreen.tsx` | Modify | Error messages + forgot password: primary → error |
| `src/features/auth/screens/SignUpScreen.tsx` | Modify | Error messages + link: primary → error |
| `src/features/profile/screens/ProfileScreen.tsx` | Modify | "Leave Household" button: primary → error |
| `src/features/auth/screens/WelcomeScreen.tsx` | Modify | Icon accent backgrounds: primary/secondary → teal/plum (auto, confirm visually) |
| `src/shared/components/ErrorBoundary.tsx` | Modify | Button bg + shadow: primary → teal (or error, since it's an error screen) |

| `src/shared/components/ui/Badge.tsx` | Modify | Fix `error` variant: currently maps to `primary-100/700`; update to `error-100/700` |
| `src/shared/components/ui/HeaderButtons.tsx` | Auto (confirm) | Save/Done buttons use `primary-100/50/600` → auto-remaps to teal tints. Note: `primary-100` is not in the safelist but is statically in className strings so NativeWind will pick it up at build time — no change needed. |

**Auto-updated (no code changes needed):**
- `OwnerBadge.tsx` — uses `primary-600`/`secondary-600` → auto remapped to teal/plum ✓
- `BalanceMeter.tsx` — uses `primary-600`/`secondary-600` → auto remapped ✓
- `AddButton.tsx` — `bg-primary-600` → teal ✓
- `HeaderButtons.tsx` — Save/Done buttons use `primary-600` for text and `primary-50/100` for bg/border → all auto-remap to teal tints ✓
- `ChipGroup.tsx` — selected `primary-600` → teal ✓
- `CardPickerField.tsx` — selected `primary-50/200` → teal tints ✓
- `AddCardModal.tsx` — `bg-primary-600` → teal ✓
- `AddTaskSheet.tsx` — `bg-primary-600` → teal ✓
- `InboxScreen.tsx` — `bg-primary-600` → teal ✓
- `MainNavigator.tsx` — `tabBarActiveTintColor` → teal ✓
- `CardsScreen.tsx` — filter dot, shuffle buttons → auto ✓

---

## Task 1: Remap tokens — primary → teal, secondary → plum, add cranberry/evergreen/error

**Files:**
- Modify: `tandem-mobile/src/shared/constants/tokens.js`
- Modify: `tandem-mobile/src/shared/constants/tokens.d.ts`
- Modify: `tandem-mobile/tailwind.config.js`

- [ ] **Step 1: Replace `tokens.js` with the new scales**

Replace the entire file content:

```js
module.exports = {
  // App shell — Teal (replaces red "primary")
  primary: {
    50: '#e5f3f7',
    100: '#c2e4ec',
    200: '#8fcdd9',
    300: '#5cb5c7',
    400: '#2e9eb5',
    500: '#1a7a8f',
    600: '#0f4c5c',
    700: '#0a3a47',
    800: '#062830',
    900: '#03151a',
  },
  // People — Plum (replaces fuchsia "secondary")
  secondary: {
    50: '#ede6f5',
    100: '#d5c4e8',
    200: '#bba0d9',
    300: '#a07bcb',
    400: '#8558bc',
    500: '#6d46a0',
    600: '#5c3d7a',
    700: '#472f5f',
    800: '#322244',
    900: '#1e132a',
  },
  // Frequency classification — Cranberry
  cranberry: {
    50: '#fcf0f2',
    100: '#f8d4da',
    200: '#f0a8b3',
    300: '#e77c8d',
    400: '#d95070',
    500: '#a8304c',
    600: '#8b1a2f',
    700: '#6f1526',
    800: '#53101c',
    900: '#380b12',
  },
  // Task actions / completion — Evergreen
  evergreen: {
    50: '#e5f0ed',
    100: '#c2ddd6',
    200: '#94c4b7',
    300: '#66ab99',
    400: '#3d8a72',
    500: '#2a6b59',
    600: '#1b4d3e',
    700: '#163d32',
    800: '#0f2d25',
    900: '#081e18',
  },
  // Validation errors / danger / destructive actions
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
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

- [ ] **Step 2: Update `tokens.d.ts` to add cranberry, evergreen, error**

```ts
declare const tokens: {
  primary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  secondary: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  cranberry: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  evergreen: { 50: string; 100: string; 200: string; 300: string; 400: string; 500: string; 600: string; 700: string; 800: string; 900: string };
  error: { 50: string; 100: string; 200: string; 500: string; 600: string; 700: string };
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

- [ ] **Step 3: Update `tailwind.config.js` safelist — add cranberry and evergreen classes**

Replace the safelist array:

```js
safelist: [
  // primary (teal) — shell
  'bg-primary-50', 'bg-primary-600', 'border-primary-200',
  // secondary (plum) — people
  'bg-secondary-50', 'bg-secondary-600', 'border-secondary-200',
  // cranberry — frequency
  'bg-cranberry-50', 'bg-cranberry-600', 'border-cranberry-200',
  'text-cranberry-600', 'text-cranberry-500', 'text-cranberry-300',
  // evergreen — task actions
  'bg-evergreen-600', 'border-evergreen-600', 'bg-evergreen-50',
  // error — danger/validation
  'bg-error-50', 'bg-error-100', 'border-error-200', 'text-error-600', 'text-error-500',
  'border-error-600',
  // evergreen text (used in TaskDetailScreen done state)
  'text-evergreen-600',
  // neutral
  'bg-neutral-500',
],
```

- [ ] **Step 4: Commit**

```bash
git add tandem-mobile/src/shared/constants/tokens.js tandem-mobile/src/shared/constants/tokens.d.ts tandem-mobile/tailwind.config.js
git commit -m "refactor: remap primary→teal, secondary→plum; add cranberry, evergreen, error tokens"
```

---

## Task 2: Update Checkbox — checked state to evergreen

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/Checkbox.tsx`

- [ ] **Step 1: Open and read `Checkbox.tsx`**

Locate the className string on line ~29:
```
checked ? 'bg-primary-600 border-primary-600' : 'bg-surface border-border'
```

- [ ] **Step 2: Replace with evergreen**

```
checked ? 'bg-evergreen-600 border-evergreen-600' : 'bg-surface border-border'
```

- [ ] **Step 3: Visually verify in app**

Run `npm run ios` in `tandem-mobile`. Navigate to a task. Check the checkbox — it should fill with deep green, not teal.

- [ ] **Step 4: Commit**

```bash
git add tandem-mobile/src/shared/components/ui/Checkbox.tsx
git commit -m "feat: checkbox checked state uses evergreen token"
```

---

## Task 3: Update error/validation states — Input, DeleteButton

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/Input.tsx`
- Modify: `tandem-mobile/src/shared/components/ui/DeleteButton.tsx`

- [ ] **Step 1: Update `Input.tsx` error state**

Find (line ~34–44):
```tsx
hasError ? 'border-primary-500' : 'border-border'
// ...
{error && <Text className="text-primary-500 text-sm mt-1">{error}</Text>}
```

Replace with:
```tsx
hasError ? 'border-error-500' : 'border-border'
// ...
{error && <Text className="text-error-500 text-sm mt-1">{error}</Text>}
```

- [ ] **Step 2: Update `DeleteButton.tsx`**

Find (line ~15–18):
```tsx
className={`bg-surface rounded-xl p-4 border border-primary-100 items-center active:bg-primary-50 ${className ?? ''}`}
// ...
<Text className="text-base font-semibold text-primary-500">{title}</Text>
```

Replace with:
```tsx
className={`bg-surface rounded-xl p-4 border border-error-200 items-center active:bg-error-50 ${className ?? ''}`}
// ...
<Text className="text-base font-semibold text-error-600">{title}</Text>
```

- [ ] **Step 3: Commit**

```bash
git add tandem-mobile/src/shared/components/ui/Input.tsx tandem-mobile/src/shared/components/ui/DeleteButton.tsx
git commit -m "feat: input error and delete button use error token (red)"
```

---

## Task 3b: Fix Badge.tsx — error variant maps to wrong token

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/Badge.tsx`

- [ ] **Step 1: Fix the error variant case**

Find (lines ~17–26):
```tsx
case 'primary':
  return 'bg-primary-100 text-primary-700';
case 'secondary':
  return 'bg-secondary-100 text-secondary-700';
// ... other cases ...
default:
  return 'bg-primary-100 text-primary-700';
```

The `error` variant case currently falls through to the default and returns `primary` classes. Find the `case 'error':` line and change its return value:
```tsx
case 'error':
  return 'bg-error-100 text-error-700';
```
The `default` fallback (`bg-primary-100 text-primary-700`) is intentionally kept as-is — it will auto-remap to teal tints after the token remap in Task 1.

- [ ] **Step 2: Commit**

```bash
git add tandem-mobile/src/shared/components/ui/Badge.tsx
git commit -m "fix: badge error variant uses error token, not primary"
```

---

## Task 4: Update overdue task styling in SwipeableTaskRow + TaskDetailScreen

**Files:**
- Modify: `tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx`
- Modify: `tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx`

- [ ] **Step 1: Update `SwipeableTaskRow.tsx` — overdue uses error, done uses evergreen**

There are several overdue references using `primary-500`/`primary-600`/`primary-200`. The pattern `overdue ? 'text-primary-600' : 'text-text'` appears **twice** — once in the `isBoard` branch (line ~104) and once in the `list` branch (line ~139). Both must be changed.

Replace every occurrence of:

| Find | Replace |
|------|---------|
| `text-primary-500 font-semibold` (overdue date) | `text-error-500 font-semibold` |
| `border border-primary-200` (overdue card border) | `border border-error-200` |
| `overdue ? 'text-primary-600' : 'text-text'` (overdue title — **2 occurrences**) | `overdue ? 'text-error-600' : 'text-text'` |
| `overdue ? 'text-primary-500 font-semibold' : 'text-text-secondary'` (overdue due date) | `overdue ? 'text-error-500 font-semibold' : 'text-text-secondary'` |

Note: The owner avatar (`bg-primary-600`/`bg-secondary-600`) stays — it auto-remaps to teal/plum correctly.

- [ ] **Step 2: Update `TaskDetailScreen.tsx` — done state and delete**

Find done state (line ~165–168):
```tsx
color={task.isDone ? COLORS.primary[600] : COLORS.text.muted}
// ...
className={`text-sm font-semibold ${task.isDone ? 'text-primary-600' : 'text-text-secondary'}`}
```
Replace with:
```tsx
color={task.isDone ? COLORS.evergreen[600] : COLORS.text.muted}
// ...
className={`text-sm font-semibold ${task.isDone ? 'text-evergreen-600' : 'text-text-secondary'}`}
```

Find delete button (line ~236–239):
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-50 rounded-xl border border-primary-100"
<Ionicons name="trash-outline" size={18} color={COLORS.primary[600]} />
<Text className="text-sm font-bold text-primary-600">Delete</Text>
```
Replace with:
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-error-50 rounded-xl border border-error-200"
<Ionicons name="trash-outline" size={18} color={COLORS.error[600]} />
<Text className="text-sm font-bold text-error-600">Delete</Text>
```

- [ ] **Step 3: Commit**

```bash
git add tandem-mobile/src/shared/components/ui/SwipeableTaskRow.tsx tandem-mobile/src/features/tasks/screens/TaskDetailScreen.tsx
git commit -m "feat: overdue states use error token; task done state uses evergreen token"
```

---

## Task 5: Update CardListItem — remove frequency backgrounds, add cranberry chip

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/CardListItem.tsx`

- [ ] **Step 1: Replace `FREQUENCY_STYLE` map**

Find (lines 9–13):
```tsx
const FREQUENCY_STYLE: Record<CardFrequency, { bg: string; border: string }> = {
  daily: { bg: 'bg-primary-50', border: 'border-primary-200' },
  weekly: { bg: 'bg-secondary-50', border: 'border-secondary-200' },
  'as-needed': { bg: 'bg-surface', border: 'border-border-light' },
};
```

Replace with:
```tsx
const FREQUENCY_CHIP: Record<CardFrequency, { label: string; color: string }> = {
  daily: { label: 'Daily', color: 'text-cranberry-600' },
  weekly: { label: 'Weekly', color: 'text-cranberry-500' },
  'as-needed': { label: 'As needed', color: 'text-cranberry-300' },
};
```

- [ ] **Step 2: Update the card wrapper — use neutral surface for all frequencies**

Find (line ~40–42):
```tsx
<TouchableOpacity
  className={`${FREQUENCY_STYLE[card.frequency].bg} p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
    isSelecting && isSelected ? 'border-primary-600' : FREQUENCY_STYLE[card.frequency].border
  }`}
```

Replace with:
```tsx
<TouchableOpacity
  className={`bg-surface p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
    isSelecting && isSelected ? 'border-primary-600' : 'border-border-light'
  }`}
```

- [ ] **Step 3: Add frequency chip below card name row**

Find this exact block (the card header row ending):
```tsx
        {!isSelecting && showOwnerBadge && <OwnerBadge name={card.owner} />}
      </View>
```

Replace with:
```tsx
        {!isSelecting && showOwnerBadge && <OwnerBadge name={card.owner} />}
      </View>
      <Text className={`text-[11px] font-semibold mb-1 ${FREQUENCY_CHIP[card.frequency].color}`}>
        {FREQUENCY_CHIP[card.frequency].label}
      </Text>
```

- [ ] **Step 4: Visually verify**

Run app, go to Cards screen. All card backgrounds should be white. Each card should show a small cranberry-toned frequency label below the title — daily is darkest, as-needed is lightest.

- [ ] **Step 5: Commit**

```bash
git add tandem-mobile/src/features/cards/components/CardListItem.tsx
git commit -m "feat: card frequency shown as cranberry chip, not colored background"
```

---

## Task 6: Update CardDetailScreen frequency selector — cranberry per-frequency

**Files:**
- Modify: `tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx`

- [ ] **Step 1: Replace `FREQUENCY_ACTIVE_STYLE`**

Find (lines 37–41):
```tsx
const FREQUENCY_ACTIVE_STYLE: Record<CardFrequency, string> = {
  daily: 'bg-primary-600',
  weekly: 'bg-secondary-600',
  'as-needed': 'bg-neutral-500',
};
```

Replace with:
```tsx
const FREQUENCY_ACTIVE_STYLE: Record<CardFrequency, string> = {
  daily: 'bg-cranberry-600',
  weekly: 'bg-cranberry-500',
  'as-needed': 'bg-cranberry-300',
};
```

- [ ] **Step 2: Visually verify**

Open a card's detail screen. The frequency segmented control should show cranberry shades — darkest for Daily, lightest for As needed.

- [ ] **Step 3: Update delete button in CardDetailScreen**

Find (lines ~281–284):
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-primary-50 rounded-xl border border-primary-100"
<Ionicons name="trash-outline" size={18} color={COLORS.primary[600]} />
<Text className="text-sm font-bold text-primary-600">Delete</Text>
```

Replace with:
```tsx
className="flex-1 flex-row items-center justify-center gap-2 py-4 bg-error-50 rounded-xl border border-error-200"
<Ionicons name="trash-outline" size={18} color={COLORS.error[600]} />
<Text className="text-sm font-bold text-error-600">Delete</Text>
```

- [ ] **Step 4: Commit**

```bash
git add tandem-mobile/src/features/cards/screens/CardDetailScreen.tsx
git commit -m "feat: frequency selector uses cranberry; delete uses error token"
```

---

## Task 7: Update ShuffleModal and SwipeModeScreen

**Files:**
- Modify: `tandem-mobile/src/features/cards/components/ShuffleModal.tsx`
- Modify: `tandem-mobile/src/features/cards/components/SwipeModeScreen.tsx`

- [ ] **Step 1: Update `ShuffleModal.tsx`**

The modal has 3 option rows with icon circles. The "Restart with defaults" row uses `primary-50/100/600` which is a destructive action — use `error`. The other two option icons use `primary`/`secondary` — those auto-remap to teal/plum.

Find the "Restart with defaults" row (line ~67–75):
```tsx
className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-100 flex-row items-center gap-4 shadow-sm"
// ...
<View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
  <Ionicons name="trash" size={20} color={COLORS.primary[600]} />
// ...
<Text className="text-base font-bold text-primary-600">Restart with defaults</Text>
```

Replace with:
```tsx
className="bg-error-50 rounded-xl p-4 mb-6 border border-error-200 flex-row items-center gap-4 shadow-sm"
// ...
<View className="w-10 h-10 bg-error-100 rounded-full items-center justify-center">
  <Ionicons name="trash" size={20} color={COLORS.error[600]} />
// ...
<Text className="text-base font-bold text-error-600">Restart with defaults</Text>
```

- [ ] **Step 2: Verify `SwipeModeScreen.tsx` auto-remaps correctly**

`SwipeModeScreen` uses alternating `bg-primary-600`/`bg-secondary-600` for partner assignment buttons. These will auto-remap to teal and plum. Open the app, start a shuffle, verify the two partner buttons show teal and plum.

- [ ] **Step 3: Commit**

```bash
git add tandem-mobile/src/features/cards/components/ShuffleModal.tsx
git commit -m "feat: shuffle modal restart uses error token (destructive)"
```

---

## Task 8: Update auth screens — error messages use error token

**Files:**
- Modify: `tandem-mobile/src/features/auth/screens/SignInScreen.tsx`
- Modify: `tandem-mobile/src/features/auth/screens/SignUpScreen.tsx`

- [ ] **Step 1: Update `SignInScreen.tsx`**

Find all `primary` references:
- `text-primary-600` on error message (line ~68) → `text-error-600`
- `text-primary-600` on "Forgot password?" link (line ~71) → `text-error-600`
- `bg-primary-600` on Sign In button (line ~75) → stays (it's the primary action, teal is correct ✓)
- `text-primary-600` on "Sign Up" link (line ~89) → keep as teal (it's a navigation link, not an error)

So only change:
```tsx
{error && <Text className="text-sm text-primary-600 mb-4">{error}</Text>}
```
→
```tsx
{error && <Text className="text-sm text-error-600 mb-4">{error}</Text>}
```

- [ ] **Step 2: Update `SignUpScreen.tsx`**

Similarly, only the inline error message should use error token:
```tsx
{error && <Text className="text-sm text-primary-600 mb-3">{error}</Text>}
```
→
```tsx
{error && <Text className="text-sm text-error-600 mb-3">{error}</Text>}
```

Leave the "Sign In" navigation link as `text-primary-600` (teal, which is fine).

- [ ] **Step 3: Commit**

```bash
git add tandem-mobile/src/features/auth/screens/SignInScreen.tsx tandem-mobile/src/features/auth/screens/SignUpScreen.tsx
git commit -m "feat: auth screen inline errors use error token"
```

---

## Task 9: Update ProfileScreen and ErrorBoundary

**Files:**
- Modify: `tandem-mobile/src/features/profile/screens/ProfileScreen.tsx`
- Modify: `tandem-mobile/src/shared/components/ErrorBoundary.tsx`

- [ ] **Step 1: Update `ProfileScreen.tsx` — "Leave Household" is destructive**

Find (line ~127–130):
```tsx
className="flex-row items-center justify-center gap-2 py-3 border border-primary-100 bg-primary-50 rounded-xl"
<Ionicons name="exit-outline" size={18} color={COLORS.primary[600]} />
<Text className="text-sm text-primary-600 font-bold">Leave Household</Text>
```

Replace with:
```tsx
className="flex-row items-center justify-center gap-2 py-3 border border-error-200 bg-error-50 rounded-xl"
<Ionicons name="exit-outline" size={18} color={COLORS.error[600]} />
<Text className="text-sm text-error-600 font-bold">Leave Household</Text>
```

- [ ] **Step 2: Update `ErrorBoundary.tsx`**

The error boundary button uses `COLORS.primary[600]` for its background and shadow. Since the error boundary is literally an error state, use `error`:

Find (lines ~86–90):
```tsx
backgroundColor: COLORS.primary[600],
// ...
shadowColor: COLORS.primary[600],
```

Replace with:
```tsx
backgroundColor: COLORS.error[600],
// ...
shadowColor: COLORS.error[600],
```

- [ ] **Step 3: Commit**

```bash
git add tandem-mobile/src/features/profile/screens/ProfileScreen.tsx tandem-mobile/src/shared/components/ErrorBoundary.tsx
git commit -m "feat: destructive/error UI uses error token (leave household, error boundary)"
```

---

## Task 10: Final visual pass — run app through all screens

- [ ] **Step 1: Run the app**

```bash
cd tandem-mobile && npm run ios
```

- [ ] **Step 2: Check each screen against the color system**

| Screen | What to verify |
|--------|---------------|
| Cards screen | White card backgrounds; cranberry frequency chips; teal add button; teal filter dot; plum/teal owner badges |
| Balance meter | Both scores in teal (you) and plum (partner); bar is teal/plum |
| Card detail | Cranberry frequency selector (dark/mid/light); teal Add Task; error-red Delete |
| Tasks screen | Evergreen checkboxes; error-red overdue dates; teal add button |
| Task detail | Evergreen done state; error-red delete |
| Shuffle modal | Teal/plum option icons; error-red Restart row |
| Swipe mode | Teal and plum partner buttons |
| Sign in / Sign up | Teal primary button; error-red inline errors |
| Profile | Error-red Leave Household |
| Tab bar | Teal active tab |

- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "refactor: complete jewel tone palette — teal shell, plum people, cranberry frequency, evergreen tasks"
```
