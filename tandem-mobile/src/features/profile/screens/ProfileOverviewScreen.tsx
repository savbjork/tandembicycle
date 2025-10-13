import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '@store';
import { useMockAuth } from '@shared/hooks/useMockAuth';

export const ProfileOverviewScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { signOut } = useMockAuth();

  return (
    <ScrollView style={styles.content}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, styles.avatarLarge]}>
          <Text style={styles.avatarTextLarge}>
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'User'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Assigned Cards</Text>
          <Text style={styles.statRowValue}>6</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Household</Text>
          <Text style={styles.statRowValue}>The Johnson Family</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Partner</Text>
          <Text style={styles.statRowValue}>Mike Johnson</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Member Since</Text>
          <Text style={styles.statRowValue}>Jan 2024</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Members</Text>
        
        <View style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SJ</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Sarah Johnson (You)</Text>
            <Text style={styles.memberCards}>Managing 6 cards</Text>
          </View>
        </View>

        <View style={styles.memberCard}>
          <View style={[styles.avatar, { backgroundColor: '#c026d3' }]}>
            <Text style={styles.avatarText}>MJ</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Mike Johnson</Text>
            <Text style={styles.memberCards}>Managing 8 cards</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Household Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Invite Household Member</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fafafa',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarTextLarge: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberCards: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});
