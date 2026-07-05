import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { Card } from '@shared/data/FakeDataStore';

interface PartnerDomainRowProps {
  card: Card;
  onPress: () => void;
}

// Partner domains are a closed door: name and head only. No counts, no tasks.
export const PartnerDomainRow: React.FC<PartnerDomainRowProps> = ({ card, onPress }) => (
  <TouchableOpacity
    className="bg-surface rounded-xl px-4 py-3.5 mb-2 border border-border-light flex-row justify-between items-center"
    onPress={onPress}
  >
    <Text className="text-base font-medium text-text">{card.name}</Text>
    <View className="flex-row items-center gap-1.5">
      <Text className="text-[13px] text-text-muted">{card.owner}</Text>
    </View>
  </TouchableOpacity>
);
