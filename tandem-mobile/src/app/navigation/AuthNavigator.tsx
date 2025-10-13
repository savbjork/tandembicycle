import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Placeholder screens - will be implemented later
import { WelcomeScreen } from '@features/auth/screens/WelcomeScreen';
import { SignInScreen } from '@features/auth/screens/SignInScreen';
import { SignUpScreen } from '@features/auth/screens/SignUpScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication flow navigator
 */
export const AuthNavigator: React.FC = () => {
  console.log('🟠 AuthNavigator - Rendering with initialRouteName: SignIn');
  
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

