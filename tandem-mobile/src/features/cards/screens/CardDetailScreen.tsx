import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CardsStackParamList } from '@app/navigation/types';
import { fakeData } from '@shared/data/FakeDataStore';
import { SwipeableTaskRow } from '@shared/components/SwipeableTaskRow';
import { COLORS } from '@shared/constants/colors';

type CardDetailRouteProp = RouteProp<CardsStackParamList, 'CardDetail'>;

export const CardDetailScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<CardDetailRouteProp>();
    const { cardName } = route.params;

    // Find the current card to get its initial state
    const currentCard = fakeData.cards.find(c => c.name === cardName);
    const [selectedOwner, setSelectedOwner] = React.useState<'Savannah' | 'Kevin'>(
        (currentCard?.owner as 'Savannah' | 'Kevin') || 'Savannah'
    );
    const [notes, setNotes] = React.useState('');

    const tasks = fakeData.tasks.filter(t => t.card === cardName);

    const handleSave = () => {
        Alert.alert(
            'Changes Saved',
            `"${cardName}" has been updated.`,
            [{ text: 'OK' }]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Card',
            `Are you sure you want to delete "${cardName}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Card Deleted', `"${cardName}" has been removed.`, [
                            { text: 'OK', onPress: () => navigation.goBack() }
                        ]);
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Header */}
            <View className="px-5 pt-[60px] pb-5 flex-row items-center border-b border-border/50 bg-surface">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center -ml-2 mr-1"
                >
                    <Ionicons name="chevron-back" size={28} color={COLORS.text.DEFAULT} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-2xl font-bold text-text tracking-tight">
                        {cardName}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleSave}
                    className="px-4 py-2 bg-primary-600 rounded-full"
                >
                    <Text className="text-sm font-bold text-white">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* ─── CARD SETTINGS ─────────────────────────────────────────────────── */}
                <View className="p-5 bg-surface mb-2">
                    <Text className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                        Card Settings
                    </Text>

                    <View className="mb-6">
                        <Text className="text-sm font-semibold text-text-secondary mb-3">Card Owner</Text>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className={`flex-1 py-3.5 rounded-xl items-center border ${selectedOwner === 'Savannah'
                                    ? 'bg-primary-50 border-primary-200'
                                    : 'bg-surface border-border'
                                    }`}
                                onPress={() => setSelectedOwner('Savannah')}
                            >
                                <Text
                                    className={`text-base font-semibold ${selectedOwner === 'Savannah' ? 'text-primary-600' : 'text-text-secondary'
                                        }`}
                                >
                                    Savannah
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={`flex-1 py-3.5 rounded-xl items-center border ${selectedOwner === 'Kevin'
                                    ? 'bg-secondary-50 border-secondary-200'
                                    : 'bg-surface border-border'
                                    }`}
                                onPress={() => setSelectedOwner('Kevin')}
                            >
                                <Text
                                    className={`text-base font-semibold ${selectedOwner === 'Kevin' ? 'text-secondary-600' : 'text-text-secondary'
                                        }`}
                                >
                                    Kevin
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-semibold text-text-secondary mb-3">Notes & Reminders</Text>
                        <TextInput
                            className="py-3 px-4 rounded-xl bg-surface-dim border border-border text-base text-text min-h-[80px]"
                            placeholder="Add card-specific notes..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>

                </View>

                {/* ─── TASKS LIST ────────────────────────────────────────────────────── */}
                <View className="px-5 pt-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                                Card Tasks
                            </Text>
                            <Text className="text-[13px] text-text-muted mt-0.5">
                                {tasks.length} total responsibilities
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="w-10 h-10 rounded-full bg-primary-600 items-center justify-center shadow-sm"
                            onPress={() => {/* Add Task */ }}
                        >
                            <Ionicons name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-surface rounded-2xl border border-border overflow-hidden">
                        {tasks.length === 0 ? (
                            <View className="py-12 items-center justify-center">
                                <Ionicons name="clipboard-outline" size={32} color={COLORS.text.muted} />
                                <Text className="text-sm text-text-muted mt-2 italic">No tasks created for this card</Text>
                            </View>
                        ) : (
                            <View>
                                {tasks.map((task, index) => (
                                    <View key={task.id}>
                                        <SwipeableTaskRow
                                            task={task}
                                            onPress={() => { }}
                                            onStatusChange={(taskId, status) => {
                                                console.log(`Status changed for ${taskId} to ${status}`);
                                            }}
                                            variant="board"
                                        />
                                        {index < tasks.length - 1 && (
                                            <View className="h-[1px] bg-border mx-4" />
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Delete Button at the bottom */}
                <TouchableOpacity
                    className="py-10 items-center"
                    onPress={handleDelete}
                >
                    <Text className="text-sm font-semibold text-primary-600">Delete this card</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
