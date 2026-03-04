import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';

interface ShuffleModalProps {
    visible: boolean;
    onClose: () => void;
    onStartSwipeShuffle: () => void;
    onStartSelectiveShuffle: () => void;
    onFreshStart: () => void;
}

export const ShuffleModal: React.FC<ShuffleModalProps> = ({
    visible,
    onClose,
    onStartSwipeShuffle,
    onStartSelectiveShuffle,
    onFreshStart,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={e => e.stopPropagation()}
                    style={{ backgroundColor: COLORS.surface.DEFAULT, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 }}
                >
                    <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />

                    <TouchableOpacity
                        className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center gap-4 shadow-sm"
                        onPress={onStartSwipeShuffle}
                    >
                        <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                            <Ionicons name="refresh" size={20} color={COLORS.primary[600]} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-text">Reassign entire existing deck</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center gap-4 shadow-sm"
                        onPress={onStartSelectiveShuffle}
                    >
                        <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center">
                            <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary[600]} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-text">Choose specific cards to assign</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 flex-row items-center gap-4 shadow-sm"
                        onPress={onFreshStart}
                    >
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                            <Ionicons name="trash" size={20} color="#dc2626" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-bold text-red-600">Restart with defaults</Text>
                        </View>
                    </TouchableOpacity>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};
