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
    onArchive: (cardIndex: number) => void;
    onSwipedAll: (updatedCards: Array<{ name: string, owner: Person }>) => void;
}

export const SwipeModeScreen: React.FC<SwipeModeScreenProps> = ({
    visible,
    onClose,
    shuffledCards,
    currentCardIndex,
    members,
    onAssign,
    onArchive,
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

    const handleArchive = () => {
        onArchive(currentCardIndex);

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
                            <Text className="text-4xl font-bold text-text text-center leading-[48px]">
                                {currentCard?.name}
                            </Text>
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
                                <Text className="text-white text-xl font-bold">{member}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            onPress={handleArchive}
                            className="py-4 rounded-2xl flex-row items-center justify-center border border-border bg-surface active:opacity-80"
                        >
                            <Text className="text-text-secondary text-base font-semibold">Don't use</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
