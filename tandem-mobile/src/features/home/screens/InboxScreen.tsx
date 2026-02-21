import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { COLORS } from '@shared/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const InboxScreen: React.FC = () => {

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

                <View className="mb-8">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="download-outline" size={20} color={COLORS.primary[600]} />
                        <Text className="text-lg font-bold text-text">Dropped</Text>
                    </View>

                    <View className="bg-surface rounded-2xl p-6 items-center border border-border">
                        <Text className="text-text-muted text-center">
                            Items you dropped into your partner's cards will appear here.
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};
