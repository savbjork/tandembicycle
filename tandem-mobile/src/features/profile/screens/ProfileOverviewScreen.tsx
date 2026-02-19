import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { useAuthStore } from '@store';
import { useMockAuth } from '@shared/hooks/useMockAuth';

export const ProfileOverviewScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { signOut } = useMockAuth();

  return (
    <ScrollView className="flex-1 px-5 pt-5 pb-5 bg-surface-dim">
      <View className="items-center mb-6">
        <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center">
          <Text className="text-white text-[32px] font-bold">
            {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
          </Text>
        </View>
        <Text className="text-2xl font-bold text-text mt-4">{user?.name || 'User'}</Text>
        <Text className="text-base text-text-secondary mt-1">{user?.email || 'user@example.com'}</Text>
      </View>

      <View className="bg-surface rounded-xl p-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-1">My Stats</Text>
        <View className="flex-row justify-between py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Assigned Cards</Text>
          <Text className="text-sm font-semibold text-text">6</Text>
        </View>
        <View className="flex-row justify-between py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Household</Text>
          <Text className="text-sm font-semibold text-text">The Johnson Family</Text>
        </View>
        <View className="flex-row justify-between py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Partner</Text>
          <Text className="text-sm font-semibold text-text">Mike Johnson</Text>
        </View>
        <View className="flex-row justify-between py-3">
          <Text className="text-sm text-text-secondary">Member Since</Text>
          <Text className="text-sm font-semibold text-text">Jan 2024</Text>
        </View>
      </View>

      <View className="bg-surface rounded-xl p-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-1">Household Members</Text>

        <View className="flex-row items-center p-3 bg-surface-muted rounded-lg mb-3">
          <View className="w-12 h-12 rounded-full bg-primary-600 items-center justify-center">
            <Text className="text-white text-base font-bold">SJ</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-text">Sarah Johnson (You)</Text>
            <Text className="text-sm text-text-secondary mt-1">Managing 6 cards</Text>
          </View>
        </View>

        <View className="flex-row items-center p-3 bg-surface-muted rounded-lg mb-3">
          <View className="w-12 h-12 rounded-full bg-secondary-600 items-center justify-center">
            <Text className="text-white text-base font-bold">MJ</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base font-semibold text-text">Mike Johnson</Text>
            <Text className="text-sm text-text-secondary mt-1">Managing 8 cards</Text>
          </View>
        </View>
      </View>

      <View className="bg-surface rounded-xl p-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-1">Settings</Text>
        <TouchableOpacity className="py-3 border-b border-border-muted">
          <Text className="text-base text-text">Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-border-muted">
          <Text className="text-base text-text">Household Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-border-muted">
          <Text className="text-base text-text">Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3">
          <Text className="text-base text-text">Invite Household Member</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="bg-surface border-2 border-border rounded-xl py-3 mt-4 mb-8"
        onPress={signOut}
      >
        <Text className="text-base font-semibold text-text text-center">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
