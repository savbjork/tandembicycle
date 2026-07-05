import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';

/**
 * Common Header buttons and semantic action buttons
 * for consistent look and feel across the app.
 */

interface HeaderButtonProps extends TouchableOpacityProps {
  label?: string;
}

/**
 * Standard Save button for headers/modals
 */
export const SaveButton: React.FC<HeaderButtonProps> = ({
  label = 'Save',
  className,
  ...props
}) => (
  <TouchableOpacity
    className={`bg-surface border border-primary-100 px-4 py-2 rounded-xl active:bg-primary-50 ${className ?? ''}`}
    {...props}
  >
    <Text className="text-base font-bold text-primary-600">{label}</Text>
  </TouchableOpacity>
);

/**
 * Standard Cancel button for headers/modals
 */
export const CancelButton: React.FC<HeaderButtonProps> = ({
  label = 'Cancel',
  className,
  ...props
}) => (
  <TouchableOpacity
    className={`bg-surface border border-border px-4 py-2 rounded-xl active:bg-surface-muted ${className ?? ''}`}
    {...props}
  >
    <Text className="text-base font-semibold text-text-secondary">{label}</Text>
  </TouchableOpacity>
);

/**
 * Standard Done button for headers/modals
 */
export const DoneButton: React.FC<HeaderButtonProps> = ({
  label = 'Done',
  className,
  ...props
}) => (
  <TouchableOpacity
    className={`bg-surface border border-primary-100 px-4 py-2 rounded-xl active:bg-primary-50 ${className ?? ''}`}
    {...props}
  >
    <Text className="text-base font-bold text-primary-600">{label}</Text>
  </TouchableOpacity>
);

/**
 * Standard Back button for screen headers
 */
export const BackButton: React.FC<TouchableOpacityProps> = ({ className, ...props }) => (
  <TouchableOpacity
    className={`w-10 h-10 items-center justify-center bg-surface border border-border rounded-xl -ml-2 active:bg-surface-muted ${className ?? ''}`}
    {...props}
  >
    <Ionicons name="chevron-back" size={24} color={COLORS.text.DEFAULT} />
  </TouchableOpacity>
);

/**
 * Standard Edit icon button (pencil)
 */
export const EditIconButton: React.FC<TouchableOpacityProps & { size?: number }> = ({
  size = 20,
  className,
  ...props
}) => (
  <TouchableOpacity className={`p-1 ${className ?? ''}`} {...props}>
    <Ionicons name="pencil-outline" size={size} color={COLORS.text.muted} />
  </TouchableOpacity>
);

/**
 * Standard Close icon button (X)
 */
export const CloseButton: React.FC<TouchableOpacityProps & { size?: number }> = ({
  size = 24,
  className,
  ...props
}) => (
  <TouchableOpacity
    className={`w-10 h-10 items-center justify-center bg-surface border border-border rounded-xl active:bg-surface-muted ${className ?? ''}`}
    {...props}
  >
    <Ionicons name="close" size={size} color={COLORS.text.secondary} />
  </TouchableOpacity>
);

/**
 * Circular checkmark button — matches AddButton style, used as save/confirm action
 */
export const CheckButton: React.FC<TouchableOpacityProps & { size?: number }> = ({
  size = 24,
  className,
  ...props
}) => (
  <TouchableOpacity
    className={`bg-primary-600 rounded-full w-11 h-11 items-center justify-center shadow-sm active:opacity-70 ${className ?? ''}`}
    {...props}
  >
    <Ionicons name="checkmark" size={size} color="white" />
  </TouchableOpacity>
);
