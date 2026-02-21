import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@store';
import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { TaskDetailScreen } from '@features/home/screens/TaskDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator - handles authentication flow
 */
export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log('🔵 RootNavigator - Render:', {
    isAuthenticated,
    isLoading,
    willShowAuth: !isAuthenticated,
    willShowMain: isAuthenticated,
    willShowLoading: isLoading
  });

  // TODO: Add a loading screen while checking auth state
  if (isLoading) {
    console.log('🔵 RootNavigator - RETURNING NULL (loading state)');
    return null;
  }

  console.log('🔵 RootNavigator - RENDERING NAVIGATION:', !isAuthenticated ? 'Auth' : 'Main');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{
            presentation: 'pageSheet',
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

