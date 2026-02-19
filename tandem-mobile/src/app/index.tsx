import React, { useEffect } from 'react';
import { Text, Platform } from 'react-native';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { initializeFirebase, isUsingFirebase } from '@infrastructure/firebase/config';
import '../../global.css';

/**
 * App entry point
 */
export const App: React.FC = () => {
  // Set a global default font for all Text components
  useEffect(() => {
    const defaultFont = Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      default: 'System',
    });

    // Ensure we don't override existing defaultProps (cast to any to satisfy TypeScript)
    const TextAny = Text as any;
    TextAny.defaultProps = TextAny.defaultProps || {};
    TextAny.defaultProps.style = [
      TextAny.defaultProps.style,
      { fontFamily: defaultFont },
    ];
  }, []);

  useEffect(() => {
    // Initialize Firebase on app start (only if configured)
    initializeFirebase();

    if (!isUsingFirebase()) {
      console.log('🎯 DEMO MODE ACTIVE');
      console.log('📱 Using mock data for all features');
      console.log('🔥 To enable Firebase, configure .env file');
    }
  }, []);

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
};
