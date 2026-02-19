import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@shared/components/ui/Text';
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
  const totalCards = balance.user1Count + balance.user2Count;
  const balancePercentage = (balance.user1Count / totalCards) * 100;
  const isFair = Math.abs(50 - balancePercentage) <= 10;

  return (
    <ScrollView className="flex-1 bg-surface-dim">
      {/* Header */}
      <View className="px-5 pt-5 pb-6">
        <Text className="text-2xl font-bold text-text tracking-tight mb-1">
          {household.name}
        </Text>
        <Text className="text-sm text-text-secondary">
          {members.length} members • {totalCards} active cards
        </Text>
      </View>

      {/* Members Card */}
      <View className="bg-surface rounded-xl p-5 mx-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-4">Household Members</Text>

        {members.map((member) => {
          const memberCards = getMockUserCards(member.id);
          const isCreator = member.id === household.createdBy;

          return (
            <TouchableOpacity
              key={member.id}
              className="flex-row items-center p-3 bg-surface-muted rounded-lg mb-3"
            >
              <View className="w-12 h-12 rounded-full bg-primary-600 items-center justify-center">
                <Text className="text-white text-base font-bold">
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-text">{member.name}</Text>
                  {isCreator && (
                    <View className="bg-primary-100 px-2 py-0.5 rounded-[10px] ml-2">
                      <Text className="text-[11px] font-semibold text-primary-600">Admin</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[13px] text-text-secondary mt-0.5">{member.email}</Text>
                <Text className="text-sm text-text-secondary mt-1">Managing {memberCards.length} cards</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity className="border-2 border-border rounded-lg py-3 items-center mt-1">
          <Text className="text-sm font-semibold text-text">Invite Members</Text>
        </TouchableOpacity>
      </View>

      {/* Household Stats Card */}
      <View className="bg-surface rounded-xl p-5 mx-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-4">Household Statistics</Text>

        <View className="flex-row justify-between items-center py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Total Cards</Text>
          <Text className="text-sm font-semibold text-text">{totalCards}</Text>
        </View>
        <View className="flex-row justify-between items-center py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Members</Text>
          <Text className="text-sm font-semibold text-text">{members.length}</Text>
        </View>
        <View className="flex-row justify-between items-center py-3 border-b border-border-muted">
          <Text className="text-sm text-text-secondary">Created</Text>
          <Text className="text-sm font-semibold text-text">
            {household.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row justify-between items-center py-3">
          <Text className="text-sm text-text-secondary">Balance Status</Text>
          <View className={`px-2.5 py-1 rounded-xl ${isFair ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <Text className={`text-xs font-semibold ${isFair ? 'text-green-700' : 'text-yellow-700'}`}>
              {isFair ? 'Fair' : 'Review'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Card */}
      <View className="bg-surface rounded-xl p-5 mx-5 mb-4 shadow-sm">
        <Text className="text-base font-semibold text-text mb-4">Settings</Text>

        <TouchableOpacity className="py-3 border-b border-border-muted">
          <Text className="text-base text-text">Edit Household Name</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3 border-b border-border-muted">
          <Text className="text-base text-text">Manage Invitations</Text>
        </TouchableOpacity>
        <TouchableOpacity className="py-3">
          <Text className="text-base text-text">Leave Household</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
