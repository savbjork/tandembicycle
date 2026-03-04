import React from 'react';
import { Text } from './Text';

interface FieldLabelProps {
    /** The label text to display */
    children: string;
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
export const FieldLabel: React.FC<FieldLabelProps> = ({
    children,
    className = '',
}) => (
    <Text
        className={`text-[11px] font-bold text-text-muted uppercase tracking-widest mb-2 ${className}`}
    >
        {children}
    </Text>
);
