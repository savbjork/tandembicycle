import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardsStackParamList } from '../types';
import { CardLibraryScreen } from '@features/cards/screens/CardLibraryScreen';

const Stack = createNativeStackNavigator<CardsStackParamList>();

export const CardsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="CardLibrary"
        component={CardLibraryScreen}
        options={{ title: 'Card Library' }}
      />
    </Stack.Navigator>
  );
};

