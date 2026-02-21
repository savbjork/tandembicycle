/**
 * Design tokens mirroring tailwind.config.js
 *
 * Use these when you need color values in JS-only contexts
 * (e.g. placeholderTextColor, 3rd-party component configs,
 * React Navigation styles) where NativeWind className can't be used.
 */
export const COLORS = {
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
    },
    white: '#ffffff',
} as const;
