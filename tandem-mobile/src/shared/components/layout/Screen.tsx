import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  className?: string;
}

/**
 * Screen wrapper component with safe area and keyboard avoidance
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
      style={styles.flex}
    >
      {scrollable ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          className={className}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.flex} className={className}>
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );

  if (safeArea) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {content}
      </SafeAreaView>
    );
  }

  return <View style={styles.safeArea}>{content}</View>;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    flexGrow: 1,
  },
});

