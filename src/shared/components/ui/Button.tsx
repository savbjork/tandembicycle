import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleSheet,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button component with consistent styling
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const buttonStyles = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    size === 'sm' && styles.sm,
    size === 'md' && styles.md,
    size === 'lg' && styles.lg,
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    size === 'sm' && styles.smText,
    size === 'lg' && styles.lgText,
    (variant === 'outline' || variant === 'ghost') && styles.outlineText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#0284c7' : '#fff'}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={textStyles}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#0284c7',
  },
  secondary: {
    backgroundColor: '#c026d3',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#0284c7',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
  },
  smText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 18,
  },
  outlineText: {
    color: '#0284c7',
  },
});
