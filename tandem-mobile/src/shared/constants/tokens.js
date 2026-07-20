// The two approved hue ramps (docs/plans/2026-07-19-cobalt-tangerine-design.md).
const COBALT = {
  50: '#EDF0FD',
  100: '#DDE3FA',
  200: '#B8C4F4',
  300: '#8FA0EC',
  400: '#5C74E6',
  500: '#2B4BE0',
  600: '#1F3AB8',
  700: '#182D8F',
  800: '#112066',
  900: '#0A1340',
};
const TANGERINE = {
  50: '#FFF3EB',
  100: '#FFE1D1',
  200: '#FFC7A3',
  300: '#FFA269',
  400: '#FF873F',
  500: '#FF6B2B',
  600: '#E25812',
  700: '#C24308',
  800: '#93330A',
  900: '#632205',
};

module.exports = {
  // Brand — Cobalt: buttons, nav, selection, links, focus (replaces teal)
  primary: COBALT,
  // People — consolidated into brand cobalt (replaces plum); the visual
  // pass may demote individual elements to neutral where the old
  // primary/secondary contrast carried meaning.
  secondary: COBALT,
  // Accent — Tangerine: strain, Net badge, celebration (replaces cranberry)
  cranberry: TANGERINE,
  // Task actions — consolidated into brand cobalt (replaces evergreen)
  evergreen: COBALT,
  // Validation errors / danger / destructive actions — functional
  // exception, deliberately NOT part of the two-hue brand palette.
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
  // Success is a brand moment, not a third hue
  success: {
    50: COBALT[50],
    100: COBALT[100],
    600: COBALT[600],
    700: COBALT[700],
  },
  // Warnings are attention signals — tangerine
  warning: {
    50: TANGERINE[50],
    100: TANGERINE[100],
    500: TANGERINE[500],
    600: TANGERINE[600],
    700: TANGERINE[700],
    800: TANGERINE[800],
  },
  neutral: {
    300: '#d1d5db', // strain "light" dot (see strainColors, Task 3)
    500: '#6b7280',
  },
  info: {
    100: COBALT[100],
    700: COBALT[700],
  },
};
