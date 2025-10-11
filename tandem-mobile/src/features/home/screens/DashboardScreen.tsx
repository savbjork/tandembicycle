import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@shared/components/layout';
import { Card, CardHeader, Avatar, Badge } from '@shared/components/ui';
import { useAuthStore } from '@store';
import {
  getMockHousehold,
  getMockUserCards,
  getMockCardTemplate,
  getMockCardBalance,
  getMockHouseholdMembers,
} from '@shared/constants/mockData';
import { CategoryColors, FrequencyLabels } from '@shared/types';

export const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const household = getMockHousehold();
  const members = getMockHouseholdMembers();
  const myCards = user ? getMockUserCards(user.id) : [];
  const balance = getMockCardBalance();
  
  const myPercentage = balance.user1Count + balance.user2Count > 0
    ? Math.round((balance.user1Count / (balance.user1Count + balance.user2Count)) * 100)
    : 50;
  const partnerPercentage = 100 - myPercentage;

  const partner = members.find((m) => m.id !== user?.id);

  return (
    <Screen>
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0]}!
          </Text>
          <Text className="text-gray-600">
            {household.name}
          </Text>
        </View>

        {/* Balance Meter */}
        <Card className="mb-4">
          <CardHeader
            title="Workload Balance"
            subtitle={`${balance.user1Count + balance.user2Count} active cards`}
          />
          
          {/* Balance Bar */}
          <View className="my-4">
            <View className="flex-row items-center mb-2">
              <Avatar name={user?.name || ''} size="sm" />
              <Text className="ml-2 font-semibold">{myPercentage}%</Text>
              <View className="flex-1" />
              <Text className="mr-2 font-semibold">{partnerPercentage}%</Text>
              <Avatar name={partner?.name || ''} size="sm" />
            </View>
            
            <View className="h-3 bg-gray-200 rounded-full flex-row overflow-hidden">
              <View 
                className="bg-primary-500"
                style={{ width: `${myPercentage}%` }}
              />
              <View 
                className="bg-secondary-500"
                style={{ width: `${partnerPercentage}%` }}
              />
            </View>
            
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-600">
                {balance.user1Count} cards
              </Text>
              <Text className="text-sm text-gray-600">
                {balance.user2Count} cards
              </Text>
            </View>
          </View>
        </Card>

        {/* My Cards */}
        <Card className="mb-4">
          <CardHeader 
            title="My Cards" 
            subtitle={`${myCards.length} responsibilities`}
          />
          <View className="space-y-2">
            {myCards.slice(0, 5).map((householdCard) => {
              const template = getMockCardTemplate(householdCard.cardId);
              if (!template) return null;
              
              return (
                <TouchableOpacity 
                  key={householdCard.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {template.name}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {FrequencyLabels[template.frequency]}
                      </Text>
                    </View>
                    <Badge 
                      label={template.category.replace('_', ' ')} 
                      variant="info"
                      size="sm"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {myCards.length > 5 && (
              <TouchableOpacity className="p-3 items-center">
                <Text className="text-primary-600 font-semibold">
                  View all {myCards.length} cards →
                </Text>
              </TouchableOpacity>
            )}
            
            {myCards.length === 0 && (
              <View className="py-8 items-center">
                <Text className="text-gray-500">No cards assigned yet</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Partner's Cards */}
        {partner && (
          <Card className="mb-4">
            <CardHeader 
              title={`${partner.name.split(' ')[0]}'s Cards`}
              subtitle={`${balance.user2Count} responsibilities`}
            />
            <View className="py-4">
              <Text className="text-gray-600 text-center">
                Your partner is managing {balance.user2Count} household cards
              </Text>
            </View>
          </Card>
        )}

        {/* Quick Stats */}
        <Card>
          <CardHeader title="Household Stats" />
          <View className="flex-row justify-around py-4">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {balance.user1Count + balance.user2Count}
              </Text>
              <Text className="text-sm text-gray-600">Total Cards</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">
                {members.length}
              </Text>
              <Text className="text-sm text-gray-600">Members</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600">
                {Math.abs(myPercentage - 50) <= 10 ? 'Fair' : 'Review'}
              </Text>
              <Text className="text-sm text-gray-600">Balance</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
};

