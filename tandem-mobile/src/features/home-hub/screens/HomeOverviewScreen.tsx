import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Input, BottomSheet, ScreenHeader } from '@shared/components/ui';
import { useAuthStore } from '@store';
import { useMockAuth } from '@shared/hooks/useMockAuth';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useNavigation } from '@react-navigation/native';

export const HomeOverviewScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { signOut } = useMockAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [householdName, setHouseholdName] = useState("The Johnson Family");
  const [newName, setNewName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState('savannah@tandem.app');
  const [newPassword, setNewPassword] = useState('••••••••');
  const [inviteEmail, setInviteEmail] = useState('');

  const partner = {
    name: 'Mike Johnson',
    initials: 'MJ',
    cards: 8,
  };

  const handleUpdateProfile = () => {
    if (newName.trim() && user) {
      setUser({ ...user, name: newName });
    }
    setIsEditModalVisible(false);
  };

  const handleLeaveHousehold = () => {
    Alert.alert(
      "Leave Household?",
      "Are you sure you want to leave 'The Johnson Family'? You will lose access to all shared cards and tasks.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => Alert.alert("Left Household", "You have successfully left the household.")
        }
      ]
    );
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }
    Alert.alert("Invite Sent!", `An invitation has been sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const navigation = useNavigation();
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('') || 'U';

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title="Home"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="flex-1 px-5 pb-5">

        {/* 1. Profile Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 shadow-sm border border-border-muted">
          <View className="flex-row items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-primary-600 items-center justify-center shadow-sm">
              <Text className="text-white text-2xl font-bold">{initials}</Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-text">{user?.name || 'User'}</Text>
              <Text className="text-sm text-text-secondary">Owner • Savannah@tandem.app</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setNewName(user?.name || '');
                setIsEditModalVisible(true);
              }}
              className="w-10 h-10 bg-surface-dim rounded-full items-center justify-center border border-border"
            >
              <Ionicons name="pencil" size={18} color={COLORS.primary[600]} />
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-border-muted mb-6" />

          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <Text className="text-base text-text font-medium">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </View>
          </View>
        </View>

        {/* 2. Household Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 shadow-sm border border-border-muted">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Household</Text>
              <Text className="text-xl font-bold text-text">{householdName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(true)}
              className="w-10 h-10 bg-surface-dim rounded-full items-center justify-center border border-border"
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Members List */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-secondary-600 items-center justify-center">
                <Text className="text-white text-sm font-bold">{partner.initials}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-text">{partner.name}</Text>
                <Text className="text-xs text-text-secondary">Partner • 8 cards</Text>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded-md">
                <Text className="text-[10px] font-bold text-green-700 uppercase">Active</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowInviteModal(true)}
              className="flex-row items-center p-3 bg-surface-dim rounded-xl border border-dashed border-border"
            >
              <View className="w-8 h-8 rounded-full bg-white items-center justify-center border border-border mr-3">
                <Ionicons name="add" size={20} color={COLORS.text.secondary} />
              </View>
              <Text className="text-sm font-semibold text-text-secondary">Invite Member</Text>
            </TouchableOpacity>
          </View>

          {/* Dangerous Zone */}
          <TouchableOpacity
            onPress={handleLeaveHousehold}
            className="flex-row items-center justify-center gap-2 py-3 border border-red-100 bg-red-50 rounded-xl"
          >
            <Ionicons name="exit-outline" size={18} color="#dc2626" />
            <Text className="text-sm text-red-600 font-bold">Leave Household</Text>
          </TouchableOpacity>
        </View>

        {/* Global Settings */}
        <View className="bg-surface rounded-3xl overflow-hidden border border-border-muted shadow-sm mb-10">
          <TouchableOpacity
            onPress={signOut}
            className="flex-row items-center p-4 bg-surface-muted"
          >
            <Ionicons name="log-out" size={20} color={COLORS.text.secondary} className="mr-4" />
            <Text className="text-base text-text flex-1 ml-3 font-semibold">Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View className="items-center mb-10">
          <Text className="text-xs text-text-muted font-medium">TANDEM HOUSEHOLD</Text>
          <Text className="text-[10px] text-text-muted mt-1 uppercase tracking-widest">v1.2.4 Premium</Text>
        </View>
      </ScrollView>

      <BottomSheet
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        containerStyle={{ padding: 32 }}
      >
        <Text className="text-2xl font-bold text-text mb-8">Edit Details</Text>

        <View className="mb-8">
          <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Personal Identity</Text>
          <Input
            label="Display Name"
            value={newName}
            onChangeText={setNewName}
            placeholder="Enter your name"
            className="bg-surface border-border-muted"
          />
          <Input
            label="Email Address"
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="savannah@tandem.app"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-surface border-border-muted mt-2"
          />
          <Input
            label="Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            className="bg-surface border-border-muted mt-2"
          />
        </View>

        <View className="mb-10">
          <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">Household Identity</Text>
          <Input
            label="Household Name"
            value={householdName}
            onChangeText={setHouseholdName}
            placeholder="Enter household name"
            className="bg-surface border-border-muted"
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleUpdateProfile}
          variant="primary"
          className="shadow-md"
        />

        <TouchableOpacity
          onPress={() => setIsEditModalVisible(false)}
          className="py-4 mt-2 items-center"
        >
          <Text className="text-text-muted font-bold">Discard</Text>
        </TouchableOpacity>
      </BottomSheet>

      <BottomSheet
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        containerStyle={{ padding: 32 }}
      >
        <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="person-add" size={32} color={COLORS.primary[600]} />
        </View>

        <Text className="text-2xl font-bold text-text mb-2">Invite Member</Text>
        <Text className="text-text-secondary text-base mb-8">
          Share the load. Invite your partner or housemate to join '{householdName}'.
        </Text>

        <Input
          label="Email Address"
          value={inviteEmail}
          onChangeText={setInviteEmail}
          placeholder="partner@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          className="bg-surface border-border-muted"
        />

        <View className="flex-row gap-4 mt-8">
          <TouchableOpacity
            onPress={() => setShowInviteModal(false)}
            className="flex-1 py-4 border border-border-strong rounded-2xl items-center"
          >
            <Text className="text-text font-bold text-base">Cancel</Text>
          </TouchableOpacity>

          <Button
            title="Send Invite"
            onPress={handleSendInvite}
            variant="primary"
            className="flex-2 shadow-md px-10"
          />
        </View>

        <View className="mt-12 p-4 bg-surface rounded-2xl border border-border-muted">
          <Text className="text-xs text-text-secondary text-center leading-5">
            The agency rule ensures that members only manage their own personal data, while shared cards and tasks are visible to all household members.
          </Text>
        </View>
      </BottomSheet>
    </View>
  );
};
