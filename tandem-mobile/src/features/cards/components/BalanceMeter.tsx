import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/components/ui';
import { type Card } from '@shared/data/FakeDataStore';

interface BalanceMeterProps {
    cards: Card[];
    currentUser: string;
    partner: string;
}

export const BalanceMeter: React.FC<BalanceMeterProps> = ({ cards, currentUser, partner }) => {
    const currentUserCardsCount = cards.filter((c: Card) => c.owner === currentUser).length;
    const partnerCardsCount = cards.filter((c: Card) => c.owner === partner).length;
    const totalCards = cards.length;

    return (
        <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-base font-semibold text-text">
                        Balance
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-0.5">
                        {totalCards} cards total
                    </Text>
                </View>
            </View>

            <View className="h-2 bg-border-muted rounded-full flex-row overflow-hidden mb-4">
                <View className="h-full bg-primary-600" style={{ width: `${(currentUserCardsCount / totalCards) * 100}%` }} />
                <View className="h-full bg-secondary-600" style={{ width: `${(partnerCardsCount / totalCards) * 100}%` }} />
            </View>

            <View className="flex-row justify-around">
                <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600">
                        {currentUserCardsCount}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {currentUser}
                    </Text>
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-bold text-secondary-600">
                        {partnerCardsCount}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {partner}
                    </Text>
                </View>
            </View>
        </View>
    );
};
