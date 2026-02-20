import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { useAuthStore } from '@store';
import { useMockAuth } from '@shared/hooks/useMockAuth';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { Button, Input } from '@shared/components/ui';

export const HomeOverviewScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { signOut } = useMockAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [householdName, setHouseholdName] = useState("The Johnson Family");
  const [newName, setNewName] = useState(user?.name || '');

  // Mocking partner data for demonstration of the "Agency Rule"
  const partner = {
    name: 'Mike Johnson',
    initials: 'MJ',
    cards: 8,
  };

  const handleUpdateName = () => {
    if (newName.trim() && householdName.trim() && user) {
      setUser({ ...user, name: newName });
      setIsEditModalVisible(false);
    }
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScrollView className="flex-1 px-5 pt-[60px] pb-5">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-[32px] font-bold text-text tracking-tight">
            Home
          </Text>
        </View>

        {/* 1. Household Section */}
        <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm border border-border-muted">
          <TouchableOpacity
            onPress={() => {
              setNewName(user?.name || '');
              setIsEditModalVisible(true);
            }}
            className="flex-row justify-between items-center mb-5"
          >
            <View>
              <Text className="text-lg font-bold text-text">{householdName}</Text>
              <Text className="text-xs text-text-secondary mt-0.5">Tap to edit hub details</Text>
            </View>
            <Ionicons name="pencil-outline" size={20} color={COLORS.text.muted} />
          </TouchableOpacity>

          {/* Partners List */}
          <View className="space-y-3 mb-6">
            {/* Self - Agency Rule */}
            <View
              className="flex-row items-center p-3 bg-primary-50 rounded-xl border border-primary-100 mb-3"
            >
              <View className="w-12 h-12 rounded-full bg-primary-600 items-center justify-center">
                <Text className="text-white text-base font-bold">
                  {user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-text">{user?.name} (You)</Text>
                <Text className="text-xs text-text-secondary">Managing 6 cards</Text>
              </View>
            </View>

            {/* Partner - Agency Rule */}
            <View className="flex-row items-center p-3 bg-surface-muted rounded-xl border border-border-muted opacity-80">
              <View className="w-12 h-12 rounded-full bg-secondary-600 items-center justify-center">
                <Text className="text-white text-base font-bold">{partner.initials}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-text">{partner.name}</Text>
                <Text className="text-xs text-text-secondary">Managing {partner.cards} cards</Text>
              </View>
            </View>
          </View>

          {/* Household Actions */}
          <View className="pt-4 border-t border-border-muted">
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(true)}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-base text-text">Hub Details</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-2">
              <Text className="text-base text-text">Invite New Partner</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between py-2 mt-2">
              <Text className="text-base text-primary-600 font-medium">Leave Household</Text>
              <Ionicons name="exit-outline" size={18} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout at bottom */}
        <TouchableOpacity
          className="bg-surface border-2 border-border rounded-xl py-3 mt-4 mb-8"
          onPress={signOut}
        >
          <Text className="text-base font-semibold text-text text-center">Sign Out</Text>
        </TouchableOpacity>

        {/* Footer Info */}
        <View className="items-center mb-10">
          <Text className="text-xs text-text-muted">Tandem v1.0.0</Text>
          <Text className="text-xs text-text-muted mt-1">Made for equal partnerships</Text>
        </View>
      </ScrollView>

      {/* Hub Details Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 bg-surface-dim"
        >
          <View className="flex-row items-center justify-between px-5 pt-[60px] pb-4 border-b border-border-muted bg-surface">
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <Text className="text-base font-semibold text-text-secondary">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-text">Hub Details</Text>
            <TouchableOpacity onPress={handleUpdateName}>
              <Text className="text-base font-semibold text-primary-600">Save</Text>
            </TouchableOpacity>
          </View>

          <View className="p-6">
            <Input
              label="Household Name"
              value={householdName}
              onChangeText={setHouseholdName}
              placeholder="Enter your household name"
              autoFocus
              className="bg-surface"
            />

            <Input
              label="Display Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              className="bg-surface"
            />

            <View className="items-center mb-8">
              <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center shadow-sm">
                <Text className="text-white text-[32px] font-bold">
                  {newName.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </Text>
              </View>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
