import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/**
 * Custom Text component that automatically applies the Nanum Myeongjo font
 * via NativeWind className. Font is defined in tailwind.config.js.
 *
 * Use this instead of React Native's Text throughout the app.
 */
export const Text = React.forwardRef<RNText, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNText ref={ref} className={`font-nanum ${className ?? ''}`} {...props} />
  )
);

Text.displayName = 'Text';
