import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { CardsScreen } from '@features/cards/screens/CardsScreen';
import { CardDetailScreen } from '@features/cards/screens/CardDetailScreen';
import { TasksScreen } from '@features/tasks/screens/TasksScreen';
import { InboxScreen } from '@features/inbox/screens/InboxScreen';
import { ProfileScreen } from '@features/profile/screens/ProfileScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStackNavigator: React.FC = () => {
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
                name="Tasks"
                component={TasksScreen}
            />
            <Stack.Screen
                name="Inbox"
                component={InboxScreen}
            />
            <Stack.Screen
                name="Profile"
                component={ProfileScreen}
            />
        </Stack.Navigator>
    );
};
