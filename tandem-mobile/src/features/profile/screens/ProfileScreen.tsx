import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Input, BottomSheet, ScreenHeader, FieldLabel, Badge, OwnerBadge } from '@shared/components/ui';
import { useAuthStore, useDataStore } from '@store';
import { useAuth } from '@shared/hooks/useAuth';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const ProfileScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { signOut } = useAuth();
  const { partner, householdName } = useCurrentUser();
  const { cards } = useDataStore();
  const navigation = useNavigation<NavigationProp>();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const partnerCardCount = cards.filter((c) => !c.archived && c.owner === partner).length;

  const handleLeaveHousehold = () => {
    Alert.alert(
      'Leave Household?',
      `Are you sure you want to leave '${householdName}'? You will lose access to all shared cards and tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => Alert.alert('Left Household', 'You have successfully left the household.'),
        },
      ]
    );
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address.');
      return;
    }
    Alert.alert('Invite Sent!', `An invitation has been sent to ${inviteEmail}`);
    setInviteEmail('');
    setShowInviteModal(false);
  };

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
            <OwnerBadge name={user?.name || 'User'} size={64} fontSize={24} className="shadow-sm" />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-text">{user?.name || 'User'}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-border-muted mb-6" />

          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('EditProfile')}
              className="flex-row justify-between items-center py-3"
            >
              <Text className="text-base text-text font-medium">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </TouchableOpacity>

            <View className="h-[1px] bg-border-muted" />

            <View className="flex-row justify-between items-center py-3">
              <Text className="text-base text-text font-medium">Notifications</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.text.muted} />
            </View>
          </View>
        </View>

        {/* 2. Household Section */}
        <View className="bg-surface rounded-3xl p-6 mb-6 shadow-sm border border-border-muted">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <FieldLabel className="mb-1">Household</FieldLabel>
              <Text className="text-xl font-bold text-text">{householdName}</Text>
            </View>
          </View>

          {/* Members List */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <OwnerBadge name={partner} size={40} />
              <View className="ml-3 flex-1">
                <Text className="text-base font-semibold text-text">{partner}</Text>
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
            <Ionicons name="log-out" size={20} color={COLORS.text.secondary} />
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
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        containerStyle={{ padding: 32 }}
      >
        {/* <View className="w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="person-add" size={32} color={COLORS.primary[600]} />
        </View> */}

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
          className="bg-surface border-border-muted"
        />

        <Button
          title="Send Invite"
          onPress={handleSendInvite}
          variant="primary"
          className="mt-8 shadow-md"
        />
      </BottomSheet>
    </View>
  );
};
