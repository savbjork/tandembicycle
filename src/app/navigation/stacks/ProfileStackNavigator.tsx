import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { ProfileOverviewScreen } from '@features/profile/screens/ProfileOverviewScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="ProfileOverview"
        component={ProfileOverviewScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};

