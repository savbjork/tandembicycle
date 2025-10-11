import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Screen } from '@shared/components/layout';
import { Card, Avatar, Button, Badge } from '@shared/components/ui';
import { useAuthStore } from '@store';
import { useMockAuth } from '@shared/hooks/useMockAuth';
import { getMockUserCards, getMockHousehold } from '@shared/constants/mockData';

export const ProfileOverviewScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { signOut } = useMockAuth();
  const household = getMockHousehold();
  const myCards = user ? getMockUserCards(user.id) : [];

  return (
    <Screen>
      <ScrollView className="flex-1 px-4 py-6">
        <View className="items-center mb-8">
          <Avatar name={user?.name || 'User'} size="xl" imageUrl={user?.avatar} />
          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {user?.name}
          </Text>
          <Text className="text-gray-600">
            {user?.email}
          </Text>
          <Badge label="Household Member" variant="primary" className="mt-2" />
        </View>

        {/* My Stats */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">My Fair Play Stats</Text>
          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Assigned Cards</Text>
              <Text className="font-semibold">{myCards.length}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Household</Text>
              <Text className="font-semibold">{household.name}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Member Since</Text>
              <Text className="font-semibold">
                {user?.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Settings */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">Account Settings</Text>
          <View className="space-y-2">
            <Button title="Edit Profile" variant="ghost" onPress={() => {}} />
            <Button title="Notification Settings" variant="ghost" onPress={() => {}} />
            <Button title="Privacy & Security" variant="ghost" onPress={() => {}} />
            <Button title="Help & Support" variant="ghost" onPress={() => {}} />
          </View>
        </Card>

        {/* App Info */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold mb-4">About</Text>
          <View className="space-y-2">
            <Button title="About Fair Play" variant="ghost" onPress={() => {}} />
            <Button title="Terms of Service" variant="ghost" onPress={() => {}} />
            <Button title="Privacy Policy" variant="ghost" onPress={() => {}} />
            <Text className="text-center text-gray-500 text-sm mt-4">
              Version 1.0.0 (Demo Mode)
            </Text>
          </View>
        </Card>

        {/* Sign Out */}
        <Card>
          <Button 
            title="Sign Out" 
            variant="outline" 
            onPress={signOut}
          />
        </Card>
      </ScrollView>
    </Screen>
  );
};

