import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddButtonProps extends TouchableOpacityProps {
  className?: string;
  bgClassName?: string;
  size?: number;
}

/**
 * Reusable '+' button component used for adding new tasks, cards, etc.
 * Provides a consistent look and feel throughout the application.
 */
export const AddButton: React.FC<AddButtonProps> = ({
  className,
  bgClassName = 'bg-primary-600',
  size = 24,
  ...props
}) => {
  return (
    <TouchableOpacity
      className={`${bgClassName} rounded-full w-11 h-11 items-center justify-center shadow-sm active:opacity-70 ${className ?? ''}`}
      {...props}
    >
      <Ionicons name="add" size={size} color="white" />
    </TouchableOpacity>
  );
};
