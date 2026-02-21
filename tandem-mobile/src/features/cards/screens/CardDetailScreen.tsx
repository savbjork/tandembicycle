import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';
import { AddButton } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CardsStackParamList } from '@app/navigation/types';
import { fakeData } from '@shared/data/FakeDataStore';
import { TaskRow } from '@shared/components/SwipeableTaskRow';
import { COLORS } from '@shared/constants/colors';

type CardDetailRouteProp = RouteProp<CardsStackParamList, 'CardDetail'>;

export const CardDetailScreen: React.FC = () => {
    const route = useRoute<CardDetailRouteProp>();
    const { cardName } = route.params;

    // Find the current card to get its initial state
    const currentCard = fakeData.cards.find(c => c.name === cardName);
    const [notes, setNotes] = React.useState('');
    const [tasks, setTasks] = React.useState(fakeData.tasks.filter(t => t.card === cardName && t.owner === 'Savannah'));

    const handleToggleDone = (taskId: string, isDone: boolean) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone } : t));
        // Update global store
        const globalTask = fakeData.tasks.find(t => t.id === taskId);
        if (globalTask) globalTask.isDone = isDone;
    };

    const isOwner = currentCard?.owner === 'Savannah';

    if (!isOwner) {
        return (
            <View className="flex-1 bg-surface-dim">
                <View className="items-center pt-3 pb-2">
                    <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
                </View>
                <ScrollView className="flex-1 px-5">
                    <View className="p-8 bg-surface mt-10 rounded-3xl border border-border shadow-sm items-center">
                        <View className="w-20 h-20 bg-secondary-100 rounded-full items-center justify-center mb-6">
                            <Ionicons name="people" size={40} color={COLORS.secondary[600]} />
                        </View>
                        <Text className="text-2xl font-bold text-text text-center mb-2">
                            {cardName}
                        </Text>
                        <Text className="text-base text-text-secondary text-center mb-4">
                            Domain of {currentCard?.owner}
                        </Text>
                        <View className="h-[0.5px] w-full bg-border my-4" />
                        <Text className="text-[15px] text-text-muted text-center leading-relaxed">
                            This card is currently assigned to {currentCard?.owner}.
                            You can't see their private tasks or manage this workbench directly.
                        </Text>
                        <Text className="text-[13px] text-primary-600 font-semibold mt-10 text-center">
                            Requests are managed in the Inbox
                        </Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-surface-dim">
            {/* Visual Cushion / Grabber */}
            <View className="items-center pt-3 pb-2">
                <View className="w-10 h-1.5 bg-border-strong rounded-full opacity-20" />
            </View>
            <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Private Workbench UI */}
                <View className="mb-6 pt-4">
                    <Text className="text-[32px] font-bold text-text tracking-tight mb-1">
                        {cardName}
                    </Text>
                    <Text className="text-base text-text-secondary">
                        Private Workbench
                    </Text>
                </View>

                <View className="bg-surface rounded-2xl p-5 border border-border shadow-sm mb-6">
                    <Text className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">
                        Card Info
                    </Text>
                    <TextInput
                        className="py-3 px-4 rounded-xl bg-surface-dim border border-border text-base text-text min-h-[80px]"
                        placeholder="Add private notes, checklists, or reminders for yourself..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={3}
                        style={{ textAlignVertical: 'top' }}
                    />
                </View>

                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-text">Private Tasks</Text>
                    <AddButton onPress={() => { }} />
                </View>

                <View>
                    {tasks.length === 0 ? (
                        <View className="bg-surface rounded-2xl border border-border py-12 items-center justify-center shadow-sm">
                            <Ionicons name="clipboard-outline" size={32} color={COLORS.text.muted} />
                            <Text className="text-sm text-text-muted mt-2 italic">No tasks created for this card</Text>
                        </View>
                    ) : (
                        <View>
                            {tasks.map((task) => (
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    onToggleDone={handleToggleDone}
                                    variant="list"
                                    hideCardName={true}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View className="mt-10 mb-10">
                    <TouchableOpacity
                        className="bg-border py-4 rounded-xl items-center flex-row justify-center gap-2"
                        onPress={() => {
                            Alert.alert('Archive Card', 'Move this project to the archive?');
                        }}
                    >
                        <Ionicons name="archive-outline" size={20} color={COLORS.text.secondary} />
                        <Text className="text-base font-semibold text-text-secondary">Archive Card</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};
