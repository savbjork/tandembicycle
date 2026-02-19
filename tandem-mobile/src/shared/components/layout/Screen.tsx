import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  className?: string;
}

/**
 * Screen wrapper component with safe area and keyboard avoidance – NativeWind edition
 */
export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  className,
}) => {
  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {scrollable ? (
        <ScrollView
          className="flex-1 flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <View className={`flex-1 ${className ?? ''}`}>{children}</View>
        </ScrollView>
      ) : (
        <View className={`flex-1 ${className ?? ''}`}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );

  if (safeArea) {
    return (
      <SafeAreaView className="flex-1 bg-surface-muted">
        {content}
      </SafeAreaView>
    );
  }

  return <View className="flex-1 bg-surface-muted">{content}</View>;
};
