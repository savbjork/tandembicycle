import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  action,
  className = '',
  titleClassName = '',
}) => {
  return (
    <View className={`flex-row justify-between items-center mb-4 ${className}`}>
      <Text className={`text-lg font-bold text-text ${titleClassName}`}>{title}</Text>
      {action}
    </View>
  );
};
