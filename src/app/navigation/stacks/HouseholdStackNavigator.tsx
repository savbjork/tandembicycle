import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HouseholdStackParamList } from '../types';
import { HouseholdOverviewScreen } from '@features/household/screens/HouseholdOverviewScreen';

const Stack = createNativeStackNavigator<HouseholdStackParamList>();

export const HouseholdStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="HouseholdOverview"
        component={HouseholdOverviewScreen}
        options={{ title: 'Household' }}
      />
    </Stack.Navigator>
  );
};

