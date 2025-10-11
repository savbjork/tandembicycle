import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeStackNavigator } from './stacks/HomeStackNavigator';
import { CardsStackNavigator } from './stacks/CardsStackNavigator';
import { HouseholdStackNavigator } from './stacks/HouseholdStackNavigator';
import { ProfileStackNavigator } from './stacks/ProfileStackNavigator';
// Icons would come from a library like react-native-heroicons or expo/vector-icons
// For now using placeholder Text

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main tab navigator - primary navigation after authentication
 */
export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="CardsTab"
        component={CardsStackNavigator}
        options={{
          tabBarLabel: 'Cards',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="HouseholdTab"
        component={HouseholdStackNavigator}
        options={{
          tabBarLabel: 'Household',
          // TODO: Add icon
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          // TODO: Add icon
        }}
      />
    </Tab.Navigator>
  );
};

