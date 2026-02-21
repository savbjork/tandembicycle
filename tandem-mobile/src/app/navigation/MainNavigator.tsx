import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { CardsStackNavigator } from './stacks/CardsStackNavigator';
import { InboxScreen } from '@features/home/screens/InboxScreen';
import { HomeOverviewScreen } from '@features/home-hub/screens/HomeOverviewScreen';
import { COLORS } from '@shared/constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border.DEFAULT,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: COLORS.surface.DEFAULT,
        },
        tabBarLabelStyle: {
          fontFamily: 'Barriecito-Regular',
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="RosterTab"
        component={CardsStackNavigator}
        options={{
          tabBarLabel: 'Roster',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="InboxTab"
        component={InboxScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HomeTab"
        component={HomeOverviewScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
