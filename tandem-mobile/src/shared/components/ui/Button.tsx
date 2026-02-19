import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { COLORS } from '@shared/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-600',
  secondary: 'bg-secondary-600',
  outline: 'bg-transparent border-2 border-primary-600',
  ghost: 'bg-transparent',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 rounded-xl',
};

const textSizeClasses: Record<string, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/**
 * Button component with consistent styling via NativeWind className
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  ...props
}) => {
  const disabledClass = disabled || isLoading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary[600] : COLORS.white}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            className={`font-semibold text-center ${textSizeClasses[size]} ${variant === 'outline' || variant === 'ghost'
              ? 'text-primary-600'
              : 'text-white'
              }`}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};
