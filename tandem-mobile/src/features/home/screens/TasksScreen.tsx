import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@shared/components/ui/Text';

export const TasksScreen: React.FC = () => {
    const [selectedPerson, setSelectedPerson] = React.useState<'Savannah' | 'Kevin'>('Savannah');

    const allCards = [
        { name: 'Daily Tidying', owner: 'Savannah', tasks: ['Wipe counters', 'Put away items', 'Quick vacuum'] },
        { name: 'Laundry', owner: 'Savannah', tasks: ['Wash clothes', 'Dry clothes', 'Fold and put away'] },
        { name: 'Meal Planning', owner: 'Savannah', tasks: ['Plan weekly menu', 'Make grocery list', 'Check pantry'] },
        { name: 'Grocery Shopping', owner: 'Savannah', tasks: ['Review list', 'Shop for groceries', 'Put away items'] },
        { name: 'Morning Routine', owner: 'Savannah', tasks: ['Wake kids', 'Make breakfast', 'Pack lunches'] },
        { name: 'School Communication', owner: 'Savannah', tasks: ['Check emails', 'Sign forms', 'Update calendar'] },
        { name: 'Dishes & Kitchen Cleanup', owner: 'Kevin', tasks: ['Load dishwasher', 'Wipe counters', 'Take out trash'] },
        { name: 'Deep Cleaning', owner: 'Kevin', tasks: ['Vacuum all rooms', 'Mop floors', 'Clean bathrooms'] },
        { name: 'Trash & Recycling', owner: 'Kevin', tasks: ['Take out trash', 'Sort recycling', 'Clean bins'] },
        { name: 'Yard Work', owner: 'Kevin', tasks: ['Mow lawn', 'Trim hedges', 'Water plants'] },
        { name: 'Car Care', owner: 'Kevin', tasks: ['Wash car', 'Check oil', 'Vacuum interior'] },
        { name: 'Dinner', owner: 'Kevin', tasks: ['Cook dinner', 'Set table', 'Clean up'] },
        { name: 'Bedtime Routine', owner: 'Kevin', tasks: ['Bath time', 'Read stories', 'Tuck in kids'] },
        { name: 'Kid Activities', owner: 'Kevin', tasks: ['Drive to activities', 'Watch practice', 'Pick up kids'] },
    ];

    const userCards = allCards.filter(card => card.owner === selectedPerson);

    return (
        <ScrollView className="flex-1 bg-surface-dim">
            {/* Header */}
            <View className="px-5 pt-[60px] pb-5">
                <Text className="text-[32px] font-bold text-text tracking-tight">
                    My Tasks
                </Text>
                <Text className="text-base text-text-secondary mt-1">
                    Tasks organized by card
                </Text>
            </View>

            {/* Person Selector */}
            <View className="flex-row gap-3 px-5 mb-5">
                <TouchableOpacity
                    className={`flex-1 py-3.5 rounded-xl items-center border-2 ${selectedPerson === 'Savannah'
                        ? 'bg-primary-600 border-primary-600'
                        : 'bg-surface border-border'
                        }`}
                    onPress={() => setSelectedPerson('Savannah')}
                >
                    <Text
                        className={`text-base font-semibold ${selectedPerson === 'Savannah' ? 'text-white' : 'text-text-secondary'
                            }`}
                    >
                        Savannah
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3.5 rounded-xl items-center border-2 ${selectedPerson === 'Kevin'
                        ? 'bg-secondary-600 border-secondary-600'
                        : 'bg-surface border-border'
                        }`}
                    onPress={() => setSelectedPerson('Kevin')}
                >
                    <Text
                        className={`text-base font-semibold ${selectedPerson === 'Kevin' ? 'text-white' : 'text-text-secondary'
                            }`}
                    >
                        Kevin
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Summary */}
            <View className="bg-surface mx-5 mb-5 p-5 rounded-xl shadow-sm">
                <Text className="text-2xl font-bold text-text">
                    {userCards.length} {userCards.length === 1 ? 'Card' : 'Cards'}
                </Text>
                <Text className="text-sm text-text-secondary mt-1">
                    {userCards.reduce((sum, card) => sum + card.tasks.length, 0)} total tasks
                </Text>
            </View>

            {/* Cards with Tasks */}
            {userCards.map((card, index) => (
                <View
                    key={index}
                    className="bg-surface mx-5 mb-4 rounded-xl p-4 shadow-sm"
                >
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-lg font-semibold text-text flex-1">
                            {card.name}
                        </Text>
                        <View
                            className={`w-7 h-7 rounded-full justify-center items-center ${selectedPerson === 'Kevin' ? 'bg-secondary-600' : 'bg-primary-600'
                                }`}
                        >
                            <Text className="text-white text-sm font-bold">
                                {card.tasks.length}
                            </Text>
                        </View>
                    </View>
                    <View className="gap-2">
                        {card.tasks.map((task, taskIndex) => (
                            <View key={taskIndex} className="flex-row items-center py-2">
                                <View className="w-5 h-5 rounded border-2 border-border-strong mr-3" />
                                <Text className="text-[15px] text-text-light flex-1">
                                    {task}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}

            {/* Empty State */}
            {userCards.length === 0 && (
                <View className="p-10 items-center">
                    <Text className="text-base text-text-muted text-center">
                        No cards assigned to {selectedPerson}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};
