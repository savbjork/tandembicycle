import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';

interface DeleteButtonProps extends TouchableOpacityProps {
  title: string;
}

/**
 * Standard Delete button used for destructive actions like deleting tasks or cards.
 * Provides a consistent look with a subtle red border and red text.
 */
export const DeleteButton: React.FC<DeleteButtonProps> = ({ title, className, ...props }) => (
  <TouchableOpacity
    className={`bg-surface rounded-xl p-4 border border-red-100 items-center active:bg-red-50 ${className ?? ''}`}
    {...props}
  >
    <Text className="text-base font-semibold text-red-500">{title}</Text>
  </TouchableOpacity>
);
