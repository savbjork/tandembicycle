import React from 'react';
import { View, TextInputProps } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Input component with label, error, and helper text – NativeWind edition
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const hasError = !!error;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-light font-medium mb-2 text-sm">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center bg-surface border-2 rounded-xl px-4 py-3 ${hasError ? 'border-primary-500' : 'border-border'
          }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className={`flex-1 text-base text-text ${className ?? ''}`}
          {...props}
        />

        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>

      {error && (
        <Text className="text-primary-500 text-sm mt-1">{error}</Text>
      )}
      {helper && !error && (
        <Text className="text-text-secondary text-sm mt-1">{helper}</Text>
      )}
    </View>
  );
};
