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
