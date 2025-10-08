import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@shared/components/layout';
import { Card, CardHeader, Avatar, Button, Badge } from '@shared/components/ui';
import { 
  getMockHousehold, 
  getMockHouseholdMembers,
  getMockUserCards,
  getMockCardBalance,
} from '@shared/constants/mockData';

export const HouseholdOverviewScreen: React.FC = () => {
  const household = getMockHousehold();
  const members = getMockHouseholdMembers();
  const balance = getMockCardBalance();

  return (
    <Screen>
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {household.name}
          </Text>
          <Text className="text-gray-600">
            {members.length} members • {balance.user1Count + balance.user2Count} active cards
          </Text>
        </View>

        {/* Members */}
        <Card className="mb-4">
          <CardHeader title="Household Members" />
          <View className="space-y-3">
            {members.map((member) => {
              const memberCards = getMockUserCards(member.id);
              const isCreator = member.id === household.createdBy;
              
              return (
                <TouchableOpacity 
                  key={member.id}
                  className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                >
                  <Avatar name={member.name} size="md" imageUrl={member.avatar} />
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center">
                      <Text className="font-semibold text-gray-900">
                        {member.name}
                      </Text>
                      {isCreator && (
                        <Badge label="Admin" variant="primary" size="sm" className="ml-2" />
                      )}
                    </View>
                    <Text className="text-sm text-gray-500">
                      {member.email}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      Managing {memberCards.length} cards
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View className="mt-4">
            <Button 
              title="Invite Members" 
              variant="outline"
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* Household Stats */}
        <Card className="mb-4">
          <CardHeader title="Household Statistics" />
          <View className="space-y-3">
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Total Cards</Text>
              <Text className="font-semibold">{balance.user1Count + balance.user2Count}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Members</Text>
              <Text className="font-semibold">{members.length}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Created</Text>
              <Text className="font-semibold">
                {household.createdAt.toLocaleDateString()}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-600">Balance Status</Text>
              <Badge 
                label={Math.abs(50 - (balance.user1Count / (balance.user1Count + balance.user2Count) * 100)) <= 10 ? 'Fair' : 'Review'} 
                variant={Math.abs(50 - (balance.user1Count / (balance.user1Count + balance.user2Count) * 100)) <= 10 ? 'success' : 'warning'}
              />
            </View>
          </View>
        </Card>

        {/* Household Settings */}
        <Card>
          <CardHeader title="Settings" />
          <View className="space-y-2">
            <Button 
              title="Edit Household Name" 
              variant="ghost"
              onPress={() => {}}
            />
            <Button 
              title="Manage Invitations" 
              variant="ghost"
              onPress={() => {}}
            />
            <Button 
              title="Leave Household" 
              variant="ghost"
              onPress={() => {}}
            />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
};

