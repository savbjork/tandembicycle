import React from 'react';
import { View } from 'react-native';
import { Text } from '@shared/components/ui';
import { type Card, FREQUENCY_WEIGHT } from '@shared/data/FakeDataStore';

interface BalanceMeterProps {
    cards: Card[];
    currentUser: string;
    partner: string;
}

export const BalanceMeter: React.FC<BalanceMeterProps> = ({ cards, currentUser, partner }) => {
    const activeCards = cards.filter((c) => !c.archived);

    const currentUserPoints = activeCards
        .filter((c) => c.owner === currentUser)
        .reduce((sum, c) => sum + FREQUENCY_WEIGHT[c.frequency], 0);

    const partnerPoints = activeCards
        .filter((c) => c.owner === partner)
        .reduce((sum, c) => sum + FREQUENCY_WEIGHT[c.frequency], 0);

    const totalPoints = currentUserPoints + partnerPoints;

    return (
        <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-base font-semibold text-text">
                        Balance
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-0.5">
                        {totalPoints} pts total
                    </Text>
                </View>
            </View>

            <View className="h-2 bg-border-muted rounded-full flex-row overflow-hidden mb-4">
                {totalPoints > 0 && (
                    <>
                        <View
                            className="h-full bg-primary-600"
                            style={{ width: `${(currentUserPoints / totalPoints) * 100}%` }}
                        />
                        <View
                            className="h-full bg-secondary-600"
                            style={{ width: `${(partnerPoints / totalPoints) * 100}%` }}
                        />
                    </>
                )}
            </View>

            <View className="flex-row justify-around">
                <View className="items-center">
                    <Text className="text-2xl font-bold text-primary-600">
                        {currentUserPoints}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {currentUser}
                    </Text>
                </View>
                <View className="items-center">
                    <Text className="text-2xl font-bold text-secondary-600">
                        {partnerPoints}
                    </Text>
                    <Text className="text-[13px] text-text-secondary mt-1">
                        {partner}
                    </Text>
                </View>
            </View>
        </View>
    );
};
