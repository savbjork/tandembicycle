import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardsStackParamList } from '../types';
import { CardsScreen } from '@features/cards/screens/CardsScreen';
import { CardDetailScreen } from '@features/cards/screens/CardDetailScreen';
import { TasksScreen } from '@features/tasks/screens/TasksScreen';
import { InboxScreen } from '@features/inbox/screens/InboxScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';

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
                options={{ presentation: 'modal' }}
            />
            <Stack.Screen
                name="MyBoard"
                component={TasksScreen}
            />
            <Stack.Screen
                name="Inbox"
                component={InboxScreen}
            />
            <Stack.Screen
                name="Home"
                component={ProfileScreen}
            />
        </Stack.Navigator>
    );
};
