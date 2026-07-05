import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Divider component for visual separation
 */
export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className }) => {
  if (orientation === 'vertical') {
    return <View className={`w-px bg-border ${className || ''}`} />;
  }

  return <View className={`h-px bg-border my-4 ${className || ''}`} />;
};
