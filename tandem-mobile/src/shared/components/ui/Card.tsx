import React from 'react';
import { View, TouchableOpacity, ViewProps } from 'react-native';
import { Text } from '@shared/components/ui/Text';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
}

/**
 * Card container component
 */
export const Card: React.FC<CardProps> = ({
  children,
  pressable = false,
  onPress,
  className,
  ...props
}) => {
  const cardClasses = `
    bg-surface rounded-2xl shadow-sm border border-border-light p-4
    ${className || ''}
  `;

  if (pressable && onPress) {
    return (
      <TouchableOpacity
        className={`${cardClasses} active:opacity-80`}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardClasses} {...props}>
      {children}
    </View>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  rightElement,
}) => (
  <View className="flex-row items-center justify-between mb-3">
    <View className="flex-1">
      <Text className="text-lg font-semibold text-text">{title}</Text>
      {subtitle && <Text className="text-sm text-text-secondary mt-1">{subtitle}</Text>}
    </View>
    {rightElement && <View className="ml-3">{rightElement}</View>}
  </View>
);

interface CardContentProps {
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ children }) => (
  <View className="flex-1">{children}</View>
);

interface CardFooterProps {
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children }) => (
  <View className="mt-3 pt-3 border-t border-border-light">{children}</View>
);


