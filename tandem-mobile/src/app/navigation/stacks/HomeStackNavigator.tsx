import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { DashboardScreen } from '@features/home/screens/DashboardScreen';
import { TasksScreen } from '@features/home/screens/TasksScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerLargeTitleShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
      />
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
      />
    </Stack.Navigator>
  );
};
