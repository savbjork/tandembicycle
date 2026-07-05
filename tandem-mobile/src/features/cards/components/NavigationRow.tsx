import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';

interface NavigationRowProps {
  onNavigateTasks: () => void;
  onNavigateInbox: () => void;
  onNavigateHome: () => void;
}

export const NavigationRow: React.FC<NavigationRowProps> = ({
  onNavigateTasks,
  onNavigateInbox,
  onNavigateHome,
}) => {
  return (
    <View className="flex-row gap-2 mb-6">
      <TouchableOpacity
        onPress={onNavigateTasks}
        className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
      >
        <Ionicons name="list-outline" size={18} color={COLORS.text.secondary} />
        <Text className="text-text-secondary font-bold text-[15px]">Tasks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNavigateInbox}
        className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
      >
        <Ionicons name="mail-outline" size={18} color={COLORS.text.secondary} />
        <Text className="text-text-secondary font-bold text-[15px]">Net</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNavigateHome}
        className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
      >
        <Ionicons name="home-outline" size={18} color={COLORS.text.secondary} />
        <Text className="text-text-secondary font-bold text-[15px]">Home</Text>
      </TouchableOpacity>
    </View>
  );
};
