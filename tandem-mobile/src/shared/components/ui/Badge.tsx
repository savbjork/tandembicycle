import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/components/ui/Text';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

/**
 * Badge component for labels and status indicators
 */
export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'sm' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-100 text-primary-700';
      case 'secondary':
        return 'bg-secondary-100 text-secondary-700';
      case 'success':
        return 'bg-success-100 text-success-700';
      case 'warning':
        return 'bg-warning-100 text-warning-700';
      case 'error':
        return 'bg-primary-100 text-primary-700';
      case 'info':
        return 'bg-info-100 text-info-700';
      default:
        return 'bg-border-muted text-text-light';
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
