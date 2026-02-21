import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { COLORS } from '@shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { fakeData, type Handoff } from '@shared/data/FakeDataStore';

export const InboxScreen: React.FC = () => {
    const selectedPerson = 'Savannah';
    const [handoffs, setHandoffs] = React.useState<Handoff[]>(fakeData.handoffs);

    const receivedHandoffs = handoffs.filter(h => h.to === selectedPerson && h.status === 'Pending');

    const handleAccept = (handoff: Handoff) => {
        Alert.alert('Accepted', 'Task added to your board.');
        setHandoffs(prev => prev.map(h => h.id === handoff.id ? { ...h, status: 'Accepted' } : h));
    };

    const handleDecline = (handoff: Handoff) => {
        Alert.alert('Declined', 'Request sent back.');
        setHandoffs(prev => prev.map(h => h.id === handoff.id ? { ...h, status: 'Declined' } : h));
    };

    return (
        <View className="flex-1 bg-surface-dim">
            <View className="px-5 pt-[60px] pb-5">
                <Text className="text-[32px] font-bold text-text tracking-tight">
                    Inbox
                </Text>
            </View>

            <ScrollView className="flex-1 px-5">
                {/* Drop Zone Items Section */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="download-outline" size={20} color={COLORS.primary[600]} />
                        <Text className="text-lg font-bold text-text">Drop Zone</Text>
                    </View>

                    <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                        <Text className="text-text-muted text-center">
                            Items your partner dropped into your cards will appear here.
                        </Text>
                    </View>
                </View>

                {/* Audibles / Handoffs Section */}
                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="megaphone-outline" size={20} color={COLORS.secondary[600]} />
                        <Text className="text-lg font-bold text-text">Audibles</Text>
                    </View>

                    {receivedHandoffs.length === 0 ? (
                        <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                            <Text className="text-text-muted text-center">
                                No help requests at the moment.
                            </Text>
                        </View>
                    ) : (
                        receivedHandoffs.map(h => (
                            <View key={h.id} className="bg-surface rounded-2xl p-5 mb-3 border border-border shadow-sm">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-xs font-bold text-secondary-600 uppercase">HELP REQUEST FROM {h.from}</Text>
                                    <Text className="text-[10px] text-text-muted">Just now</Text>
                                </View>
                                <Text className="text-base font-semibold text-text mb-1">
                                    {fakeData.tasks.find(t => t.id === h.taskId)?.name || 'Unknown Task'}
                                </Text>
                                <Text className="text-sm text-text-secondary mb-4 italic">"{h.message}"</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        className="flex-1 bg-surface border border-border py-2.5 rounded-xl items-center"
                                        onPress={() => handleDecline(h)}
                                    >
                                        <Text className="text-sm font-semibold text-text-secondary">Decline</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-1 bg-secondary-600 py-2.5 rounded-xl items-center"
                                        onPress={() => handleAccept(h)}
                                    >
                                        <Text className="text-sm font-semibold text-white">Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};
