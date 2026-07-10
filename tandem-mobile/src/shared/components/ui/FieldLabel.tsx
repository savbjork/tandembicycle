import React from 'react';
import { Text } from './Text';

interface FieldLabelProps {
  /**
   * The label text to display. Accepts ReactNode (not just string) so callers
   * can nest a colored <Text> span when they need a color override — appending
   * a text-color className here is not reliable because NativeWind resolves
   * competing same-property utility classes by generated-stylesheet order, not
   * by string position (see src/shared/utils/hueClasses.ts for the same caveat).
   */
  children: React.ReactNode;
  /** Extra className to merge */
  className?: string;
}

/**
 * Standardized uppercase field label used above form inputs, chip groups,
 * and section headers throughout the app.
 *
 * Replaces the duplicated pattern:
 *   `<Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2">`
 * which appeared in CardsScreen, TasksScreen, TaskDetailScreen,
 * CardDetailScreen, and ProfileScreen.
 *
 * @example
 * <FieldLabel>Card</FieldLabel>
 * <FieldLabel className="mb-4">Household Identity</FieldLabel>
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({ children, className = '' }) => (
  <Text
    className={`text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 ${className}`}
  >
    {children}
  </Text>
);
