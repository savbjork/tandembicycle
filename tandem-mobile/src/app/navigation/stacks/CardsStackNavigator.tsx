import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardsStackParamList } from '../types';
import { CardsScreen } from '@features/cards/screens/CardsScreen';
import { CardDetailScreen } from '@features/cards/screens/CardDetailScreen';

const Stack = createNativeStackNavigator<CardsStackParamList>();

export const CardsStackNavigator: React.FC = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="CardsList"
                component={CardsScreen}
            />
            <Stack.Screen
                name="CardDetail"
                component={CardDetailScreen}
            />
        </Stack.Navigator>
    );
};
