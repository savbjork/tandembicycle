import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddButtonProps extends TouchableOpacityProps {
    className?: string;
    size?: number;
}

/**
 * Reusable '+' button component used for adding new tasks, cards, etc.
 * Provides a consistent look and feel throughout the application.
 */
export const AddButton: React.FC<AddButtonProps> = ({
    className,
    size = 20,
    ...props
}) => {
    return (
        <TouchableOpacity
            className={`bg-primary-600 rounded-full w-10 h-10 items-center justify-center shadow-sm active:opacity-70 ${className ?? ''}`}
            {...props}
        >
            <Ionicons name="add" size={size} color="white" />
        </TouchableOpacity>
    );
};
