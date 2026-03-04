import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@shared/components/ui';
import { COLORS } from '@shared/constants/colors';
import { type Person } from '@shared/data/FakeDataStore';
import { Ionicons } from '@expo/vector-icons';

interface SwipeModeScreenProps {
    visible: boolean;
    onClose: () => void;
    shuffledCards: Array<{ name: string, owner: Person }>;
    currentCardIndex: number;
    members: Person[];
    onAssign: (cardIndex: number, owner: Person) => void;
    onSwipedAll: (updatedCards: Array<{ name: string, owner: Person }>) => void;
}

export const SwipeModeScreen: React.FC<SwipeModeScreenProps> = ({
    visible,
    onClose,
    shuffledCards,
    currentCardIndex,
    members,
    onAssign,
    onSwipedAll,
}) => {
    const isLastCard = currentCardIndex === shuffledCards.length - 1;
    const currentCard = shuffledCards[currentCardIndex];

    const handleAssign = (member: Person) => {
        onAssign(currentCardIndex, member);

        if (isLastCard) {
            setTimeout(() => {
                onSwipedAll(shuffledCards);
            }, 100);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-surface-dim pt-16 pb-12 px-6">
                <View className="flex-row justify-between items-center mb-10">
                    <View>
                        <Text className="text-3xl font-bold text-text tracking-tight">
                            Assign Cards
                        </Text>
                        <Text className="text-text-secondary mt-1">
                            Balanced ownership, simplified.
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-surface w-10 h-10 rounded-full items-center justify-center border border-border"
                    >
                        <Ionicons name="close" size={24} color={COLORS.text.muted} />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 justify-center">
                    <View className="mb-12">
                        <View className="bg-surface rounded-3xl p-10 items-center justify-center shadow-xl border border-border-light min-h-[300px]">
                            <Text className="text-[11px] font-bold text-primary-600 uppercase tracking-[2px] mb-4">
                                Currently Assigning
                            </Text>
                            <Text className="text-4xl font-bold text-text text-center leading-[48px]">
                                {currentCard?.name}
                            </Text>

                            <View className="mt-8 bg-surface-dim px-4 py-2 rounded-full border border-border">
                                <Text className="text-sm font-semibold text-text-secondary">
                                    Card {currentCardIndex + 1} of {shuffledCards.length}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="gap-4">
                        <Text className="text-center text-[13px] font-bold text-text-muted uppercase tracking-widest mb-2">
                            Whose responsibility is this?
                        </Text>

                        {members.map((member, index) => (
                            <TouchableOpacity
                                key={member}
                                onPress={() => handleAssign(member)}
                                className={`${index % 2 === 0 ? 'bg-primary-600' : 'bg-secondary-600'} py-6 rounded-2xl flex-row items-center justify-center shadow-md active:opacity-90`}
                            >
                                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
                                    <Text className="text-white font-bold">{member.charAt(0)}</Text>
                                </View>
                                <Text className="text-white text-xl font-bold">{member}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View className="mt-10 items-center">
                    <View className="flex-row gap-1">
                        {shuffledCards.map((_, i) => (
                            <View
                                key={i}
                                className={`h-1.5 rounded-full ${i === currentCardIndex ? 'w-8 bg-primary-600' : 'w-2 bg-border-strong'}`}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};
