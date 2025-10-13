import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{household.name}</Text>
        <Text style={styles.screenSubtitle}>
          {members.length} members • {totalCards} active cards
        </Text>
      </View>

      {/* Members Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Members</Text>
        
        {members.map((member) => {
          const memberCards = getMockUserCards(member.id);
          const isCreator = member.id === household.createdBy;
          
          return (
            <TouchableOpacity 
              key={member.id}
              style={styles.memberCard}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {isCreator && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberEmail}>{member.email}</Text>
                <Text style={styles.memberCards}>Managing {memberCards.length} cards</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        
        <TouchableOpacity style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite Members</Text>
        </TouchableOpacity>
      </View>

      {/* Household Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Statistics</Text>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Cards</Text>
          <Text style={styles.statValue}>{totalCards}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>{members.length}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Created</Text>
          <Text style={styles.statValue}>
            {household.createdAt.toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statRow, styles.statRowLast]}>
          <Text style={styles.statLabel}>Balance Status</Text>
          <View style={[styles.statusBadge, isFair ? styles.statusBadgeSuccess : styles.statusBadgeWarning]}>
            <Text style={[styles.statusBadgeText, isFair ? styles.statusBadgeTextSuccess : styles.statusBadgeTextWarning]}>
              {isFair ? 'Fair' : 'Review'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Household Name</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Manage Invitations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]}>
          <Text style={styles.settingText}>Leave Household</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
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
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
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
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  adminBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  memberEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  memberCards: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  inviteButton: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  inviteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeWarning: {
    backgroundColor: '#fef3c7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextSuccess: {
    color: '#15803d',
  },
  statusBadgeTextWarning: {
    color: '#a16207',
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
  },
});
