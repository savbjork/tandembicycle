import React from 'react';
import { View } from 'react-native';
import { Text, ScreenHeader } from '@shared/components/ui';
import { useNavigation } from '@react-navigation/native';

// Placeholder — the old DropZoneItem sender/receiver Inbox was removed with the
// net/domains data model migration. The real Net screen lands in Task 6.
export const InboxScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader title="Net" showBack onBack={() => navigation.goBack()} />
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-base text-text-secondary text-center">
          The Net is coming here
        </Text>
      </View>
    </View>
  );
};
