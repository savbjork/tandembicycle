import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';
import { COLORS } from '@shared/constants/colors';

/**
 * Custom TextInput component that automatically applies the Barriecito font
 * via NativeWind className and sets a consistent placeholder color.
 *
 * Use this instead of React Native's TextInput throughout the app.
 */
export const TextInput = React.forwardRef<RNTextInput, TextInputProps & { className?: string }>(
    ({ className, placeholderTextColor, ...props }, ref) => (
        <RNTextInput
            ref={ref}
            className={`font-barriecito ${className ?? ''}`}
            placeholderTextColor={placeholderTextColor ?? COLORS.text.muted}
            {...props}
        />
    )
);

TextInput.displayName = 'TextInput';
