import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ScreenHeader } from '@shared/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useNavigation } from '@react-navigation/native';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function daysRemaining(archivedAt: string): number {
  const archived = new Date(archivedAt).getTime();
  const now = Date.now();
  const elapsed = now - archived;
  return Math.max(0, Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000)));
}

export const ArchivedCardsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { cards, removeCard, unarchiveCard } = useDataStore();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  // On mount: permanently delete cards archived more than 30 days ago
  useEffect(() => {
    const expired = cards.filter(
      (c) => c.archived && c.archivedAt && daysRemaining(c.archivedAt) === 0
    );
    expired.forEach((c) => removeCard(c.name));
  }, []);

  const archivedCards = cards
    .filter((c) => c.archived && c.archivedAt)
    .sort((a, b) => new Date(b.archivedAt!).getTime() - new Date(a.archivedAt!).getTime());

  const toggleSelection = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleRestore = () => {
    unarchiveCard(selectedNames);
    setSelectedNames([]);
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title="Archive"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          selectedNames.length > 0 ? (
            <TouchableOpacity
              onPress={handleRestore}
              className="bg-primary-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white text-sm font-semibold">
                Restore ({selectedNames.length})
              </Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView className="flex-1 px-5 pt-4">
        {archivedCards.length === 0 ? (
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-text-muted text-base">No archived cards</Text>
          </View>
        ) : (
          <View className="mb-6">
            {archivedCards.map((card) => {
              const isSelected = selectedNames.includes(card.name);
              const days = daysRemaining(card.archivedAt!);
              return (
                <TouchableOpacity
                  key={card.name}
                  onPress={() => toggleSelection(card.name)}
                  className={`bg-surface p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${
                    isSelected ? 'border-primary-600' : 'border-border-light'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name={isSelected ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
                    />
                    <View className="flex-1">
                      <Text className="text-[17px] font-bold text-text">{card.name}</Text>
                      <Text className="text-xs text-text-muted mt-0.5">
                        Deletes in {days} day{days !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
};
