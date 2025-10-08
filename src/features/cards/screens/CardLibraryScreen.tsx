import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen } from '@shared/components/layout';
import { Card, Badge } from '@shared/components/ui';
import { MOCK_CARD_TEMPLATES } from '@shared/constants/mockData';
import { CardCategory, CategoryLabels, FrequencyLabels } from '@shared/types';

export const CardLibraryScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>('all');
  
  const filteredCards = selectedCategory === 'all' 
    ? MOCK_CARD_TEMPLATES
    : MOCK_CARD_TEMPLATES.filter(card => card.category === selectedCategory);
    
  const categories = Object.entries(CategoryLabels);

  return (
    <Screen>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-4 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            Card Library
          </Text>
          <Text className="text-gray-600">
            {MOCK_CARD_TEMPLATES.length} Fair Play cards to manage household responsibilities
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedCategory === 'all' ? 'bg-primary-600' : 'bg-gray-200'
            }`}
          >
            <Text className={selectedCategory === 'all' ? 'text-white font-semibold' : 'text-gray-700'}>
              All Cards
            </Text>
          </TouchableOpacity>
          
          {categories.map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(key as CardCategory)}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedCategory === key ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <Text className={selectedCategory === key ? 'text-white font-semibold' : 'text-gray-700'}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Cards Grid */}
        <View className="px-4 pb-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="mb-3" pressable onPress={() => {}}>
              <View>
                <View className="flex-row items-start justify-between mb-2">
                  <Text className="text-lg font-semibold text-gray-900 flex-1">
                    {card.name}
                  </Text>
                  <Badge 
                    label={FrequencyLabels[card.frequency]} 
                    variant="info"
                    size="sm"
                  />
                </View>
                
                <Text className="text-gray-600 mb-3">
                  {card.description}
                </Text>
                
                <View className="border-t border-gray-100 pt-3">
                  <Text className="text-xs font-semibold text-gray-500 mb-1">
                    What "owning" this card means:
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    • <Text className="font-medium">Conception:</Text> {card.conceptionDescription}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-1">
                    • <Text className="font-medium">Planning:</Text> {card.planningDescription}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    • <Text className="font-medium">Execution:</Text> {card.executionDescription}
                  </Text>
                </View>
                
                <TouchableOpacity className="mt-3 bg-primary-50 py-2 rounded-lg">
                  <Text className="text-primary-600 font-semibold text-center">
                    Add to Household
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

