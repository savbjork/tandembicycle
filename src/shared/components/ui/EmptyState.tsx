import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty state component for when there's no data to display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      {icon && <View className="mb-4">{icon}</View>}
      
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        {title}
      </Text>
      
      {description && (
        <Text className="text-gray-500 text-center mb-6">
          {description}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} size="md" />
      )}
    </View>
  );
};

