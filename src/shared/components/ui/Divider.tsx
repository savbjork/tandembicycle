import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Divider component for visual separation
 */
export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
}) => {
  if (orientation === 'vertical') {
    return <View className={`w-px bg-gray-200 ${className || ''}`} />;
  }

  return <View className={`h-px bg-gray-200 my-4 ${className || ''}`} />;
};

