import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

/**
 * Badge component for labels and status indicators
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-100 text-primary-700';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-700';
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'warning':
        return 'bg-amber-100 text-amber-700';
      case 'error':
        return 'bg-red-100 text-red-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSizeStyles = () => {
    return size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  };

  return (
    <View className={`rounded-full ${getVariantStyles()} ${getSizeStyles()} self-start`}>
      <Text className={`font-medium ${getVariantStyles()}`}>{label}</Text>
    </View>
  );
};

