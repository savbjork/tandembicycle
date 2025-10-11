import React, { useEffect } from 'react';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import { initializeFirebase, isUsingFirebase } from '@infrastructure/firebase/config';

/**
 * App entry point
 */
export const App: React.FC = () => {
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

