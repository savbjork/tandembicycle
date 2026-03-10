import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Input, ScreenHeader, FieldLabel } from '@shared/components/ui';
import { useAuthStore, useDataStore } from '@store';
import { supabase } from '@lib/supabase';
import { useNavigation } from '@react-navigation/native';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuthStore();
  const { renameOwner } = useDataStore();

  const [newName, setNewName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState('savannah@tandem.app');
  const [newPassword, setNewPassword] = useState('');
  const [householdName, setHouseholdName] = useState('The Johnson Family');

  const handleSave = async () => {
    const trimmed = newName.trim();
    if (trimmed && user && trimmed !== user.name) {
      const oldName = user.name;
      await supabase.auth.updateUser({ data: { display_name: trimmed } });
      await supabase.from('profiles').update({ display_name: trimmed }).eq('user_id', user.id);
      setUser({ ...user, name: trimmed });
      renameOwner(oldName, trimmed);
    }
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title="Edit Profile"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1 px-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="bg-surface rounded-3xl p-6 mt-4 mb-6 border border-border-muted shadow-sm">
            <FieldLabel className="mb-4">Personal Identity</FieldLabel>
            <Input
              label="Display Name"
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              className="bg-surface border-border-muted"
              autoFocus
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

          <View className="bg-surface rounded-3xl p-6 mb-8 border border-border-muted shadow-sm">
            <FieldLabel className="mb-4">Household Identity</FieldLabel>
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
            onPress={handleSave}
            variant="primary"
            className="shadow-md mb-4"
          />

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="py-4 items-center mb-10"
          >
            <Text className="text-text-muted font-bold">Discard</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};
