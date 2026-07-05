import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '@shared/components/ui';
import type { Card } from '@shared/data/FakeDataStore';

interface UnclaimedDomainRowProps {
  card: Card;
  onClaim: () => void;
}

export const UnclaimedDomainRow: React.FC<UnclaimedDomainRowProps> = ({ card, onClaim }) => (
  <View className="bg-surface-dim rounded-xl px-4 py-3.5 mb-2 border border-border border-dashed flex-row justify-between items-center">
    <Text className="text-base font-medium text-text-secondary">{card.name}</Text>
    <TouchableOpacity className="bg-secondary-600 px-4 py-2 rounded-lg" onPress={onClaim}>
      <Text className="text-white text-[13px] font-semibold">Claim</Text>
    </TouchableOpacity>
  </View>
);
