# Color Palette Consolidation Design

**Date:** 2026-03-23

## Summary

Eliminate the dual-source color problem (tailwind.config.js and colors.ts manually kept in sync), add missing tokens, and replace all hardcoded colors in components with semantic tokens. Prepares the codebase for dark mode without implementing it.

## Goals

- Single source of truth for all color values
- No hardcoded hex values or raw Tailwind color classes (`bg-red-*`, `bg-yellow-*`, etc.) in components
- All tokens available both as NativeWind className and as JS object for prop usage

## Architecture

### Canonical source: `src/shared/constants/tokens.js` + `tokens.d.ts`

`tokens.js` is a plain JavaScript file containing all raw color values with numeric keys (e.g. `600: '#dc2626'`). Plain JS is required because `tailwind.config.js` is processed by Node.js at build time and Tailwind CSS v3 does not support TypeScript config files.

`tokens.d.ts` sits alongside `tokens.js` and declares the full TypeScript type for the module. TypeScript automatically uses this declaration file when `colors.ts` imports `./tokens` — no `require`, no `any`, full type safety.

### `tailwind.config.js`

`require`s tokens.js and spreads values into `theme.extend.colors`. No color values defined inline.

### `src/shared/constants/colors.ts`

`import tokens from './tokens'` — TypeScript resolves `tokens.d.ts` for types. Re-exports as `COLORS` with the same shape as today — no call sites change.

## Token Changes

No existing tokens are renamed or removed. Two tokens are added to match what already exists in `colors.ts` but was missing from `tailwind.config.js`:

- `success` — `{ 50, 100, 600, 700 }` (green)
- `warning` — `{ 50, 100, 500, 600, 800 }` (yellow/amber) — `800` added for `text-yellow-800` usage

One new token:

- `neutral` — `{ 500: '#6b7280' }` — covers the solid mid-gray used for the "As-needed" frequency chip

## Hardcoded Color Replacements

| Location | Hardcoded | Replacement |
|---|---|---|
| CardDetailScreen, TaskDetailScreen | `bg-red-50 border-red-100 text-red-600` | `bg-primary-50 border-primary-100 text-primary-600` |
| CardDetailScreen, TaskDetailScreen | `#dc2626` (Ionicons) | `COLORS.primary[600]` |
| CardDetailScreen, TaskDetailScreen | `bg-yellow-50 border-yellow-100 text-yellow-800` | `bg-warning-50 border-warning-100 text-warning-800` |
| CardDetailScreen, TaskDetailScreen | `#ca8a04` (Ionicons) | `COLORS.warning[600]` |
| CardDetailScreen | `bg-gray-500` (frequency chip) | `bg-neutral-500` |
| ShuffleModal | `bg-red-50 border-red-100 bg-red-100 text-red-600` | `bg-primary-50 border-primary-100 bg-primary-100 text-primary-600` |
| ProfileScreen | `border-red-100 bg-red-50 text-red-600` | `border-primary-100 bg-primary-50 text-primary-600` |
| ProfileScreen | `#dc2626` (Ionicons) | `COLORS.primary[600]` |
| SignInScreen, SignUpScreen | `text-red-600` (error text) | `text-primary-600` |
| SignInScreen, SignUpScreen | `#374151` (Ionicons) | `COLORS.text.light` |
| DeleteButton | `border-red-100 text-red-500` | `border-primary-100 text-primary-500` |
| Divider | `bg-gray-200` | `bg-border` |
| SwipeableTaskRow | `text-red-500`, `text-red-600` | `text-primary-500`, `text-primary-600` |
| Badge | `bg-green-100 text-green-700` | `bg-success-100 text-success-700` |
| Badge | `bg-red-100 text-red-700` | `bg-primary-100 text-primary-700` |
| Badge | `bg-gray-100 text-gray-700` | `bg-surface-hover text-text-secondary` |
| EmptyState | `text-gray-900`, `text-gray-500` | `text-text`, `text-text-secondary` |
| ErrorBoundary | `shadowColor: '#000'` | `COLORS.text.DEFAULT` |

**Left alone:** `Avatar`'s `bg-blue-500`/`bg-green-500` initials colors — intentionally varied, not semantic.

## Files Changed

| File | Change |
|---|---|
| `src/shared/constants/tokens.js` | Create — canonical color values (plain JS) |
| `src/shared/constants/tokens.d.ts` | Create — TypeScript type declarations for tokens.js |
| `src/shared/constants/colors.ts` | Rewrite to import from tokens via tokens.d.ts |
| `tailwind.config.js` | Rewrite to require tokens.js |
| `src/features/cards/screens/CardDetailScreen.tsx` | Replace hardcoded colors |
| `src/features/tasks/screens/TaskDetailScreen.tsx` | Replace hardcoded colors |
| `src/features/cards/components/ShuffleModal.tsx` | Replace hardcoded colors |
| `src/features/profile/screens/ProfileScreen.tsx` | Replace hardcoded colors |
| `src/features/auth/screens/SignInScreen.tsx` | Replace hardcoded colors |
| `src/features/auth/screens/SignUpScreen.tsx` | Replace hardcoded colors |
| `src/shared/components/ui/DeleteButton.tsx` | Replace hardcoded colors |
| `src/shared/components/ui/Divider.tsx` | Replace hardcoded colors |
| `src/shared/components/ui/SwipeableTaskRow.tsx` | Replace hardcoded colors |
| `src/shared/components/ui/Badge.tsx` | Replace hardcoded colors |
| `src/shared/components/ui/EmptyState.tsx` | Replace hardcoded colors |
| `src/shared/components/ErrorBoundary.tsx` | Replace hardcoded colors |
