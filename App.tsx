import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * Fair Play App - Demo Version
 * Showing full UI with mock data (no complex navigation for now)
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<'home' | 'cards' | 'household' | 'profile'>('home');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Fair Play</Text>
          <Text style={styles.headerSubtitle}>The Johnson Family • Riding Together</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'cards' && <CardsScreen />}
          {currentScreen === 'household' && <HouseholdScreen />}
          {currentScreen === 'profile' && <ProfileScreen />}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={[styles.navText, currentScreen === 'home' && styles.navTextActive]}>
              🏠 Home
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('cards')}
          >
            <Text style={[styles.navText, currentScreen === 'cards' && styles.navTextActive]}>
              🃏 Cards
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('household')}
          >
            <Text style={[styles.navText, currentScreen === 'household' && styles.navTextActive]}>
              👥 Family
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('profile')}
          >
            <Text style={[styles.navText, currentScreen === 'profile' && styles.navTextActive]}>
              👤 Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Home Screen
function HomeScreen() {
  return (
    <View>
      <Text style={styles.screenTitle}>Welcome back, Sarah!</Text>
      <Text style={styles.welcomeSubtitle}>Keep pedaling forward together</Text>
      
      {/* Balance Meter */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Workload Balance</Text>
        <Text style={styles.cardSubtitle}>15 active cards</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Sarah: 43%</Text>
          <Text style={styles.balanceText}>Mike: 57%</Text>
        </View>
        
        <View style={styles.balanceBar}>
          <View style={[styles.balanceBarFill, { width: '43%', backgroundColor: '#dc2626' }]} />
          <View style={[styles.balanceBarFill, { width: '57%', backgroundColor: '#c026d3' }]} />
        </View>
        
        <View style={styles.balanceCounts}>
          <Text style={styles.balanceCount}>6 cards</Text>
          <Text style={styles.balanceCount}>8 cards</Text>
        </View>
      </View>

      {/* My Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Cards (Sarah)</Text>
        <Text style={styles.cardSubtitle}>6 responsibilities</Text>
        
        {['Daily Tidying', 'Laundry', 'Meal Planning', 'Grocery Shopping', 'Morning Routine', 'School Communication'].map((card, i) => (
          <View key={i} style={styles.taskCard}>
            <Text style={styles.taskName}>{card}</Text>
            <Text style={styles.taskFrequency}>Weekly</Text>
          </View>
        ))}
      </View>

      {/* Partner's Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mike's Cards</Text>
        <Text style={styles.cardSubtitle}>8 responsibilities</Text>
        
        {['Dishes & Kitchen Cleanup', 'Deep Cleaning', 'Trash & Recycling', 'Yard Work', 'Car Care', 'Dinner', 'Bedtime Routine', 'Kid Activities'].map((card, i) => (
          <View key={i} style={[styles.taskCard, styles.partnerTaskCard]}>
            <Text style={styles.taskName}>{card}</Text>
            <Text style={styles.taskFrequency}>Weekly</Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Total Cards</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValueGood}>Fair</Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Cards Screen
function CardsScreen() {
  const cards = [
    'Daily Tidying', 'Laundry', 'Dishes', 'Deep Cleaning', 'Trash',
    'Meal Planning', 'Grocery Shopping', 'Breakfast', 'Lunch', 'Dinner',
    'Morning Routine', 'Bedtime', 'School', 'Homework', 'Activities'
  ];

  return (
    <View>
      <Text style={styles.screenTitle}>Card Library</Text>
      <Text style={styles.screenSubtitle}>36 Fair Play cards available</Text>
      
      {cards.map((card, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{card}</Text>
          <Text style={styles.cardDescription}>
            Manage all aspects: conception, planning, and execution
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Household</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

// Household Screen
function HouseholdScreen() {
  return (
    <View>
      <Text style={styles.screenTitle}>The Johnson Family</Text>
      <Text style={styles.screenSubtitle}>2 members • 15 active cards</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Members</Text>
        
        <View style={styles.memberCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SJ</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Sarah Johnson</Text>
            <Text style={styles.memberEmail}>sarah@example.com</Text>
            <Text style={styles.memberCards}>Managing 6 cards</Text>
          </View>
        </View>

        <View style={styles.memberCard}>
          <View style={[styles.avatar, { backgroundColor: '#c026d3' }]}>
            <Text style={styles.avatarText}>MJ</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>Mike Johnson</Text>
            <Text style={styles.memberEmail}>mike@example.com</Text>
            <Text style={styles.memberCards}>Managing 8 cards</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Total Cards</Text>
          <Text style={styles.statRowValue}>15</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Members</Text>
          <Text style={styles.statRowValue}>2</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Balance Status</Text>
          <Text style={[styles.statRowValue, { color: '#10b981' }]}>Fair</Text>
        </View>
      </View>
    </View>
  );
}

// Profile Screen
function ProfileScreen() {
  return (
    <View>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, styles.avatarLarge]}>
          <Text style={styles.avatarTextLarge}>SJ</Text>
        </View>
        <Text style={styles.profileName}>Sarah Johnson</Text>
        <Text style={styles.profileEmail}>sarah@example.com</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>My Fair Play Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Assigned Cards</Text>
          <Text style={styles.statRowValue}>6</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Household</Text>
          <Text style={styles.statRowValue}>The Johnson Family</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statRowLabel}>Member Since</Text>
          <Text style={styles.statRowValue}>Jan 2024</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Privacy & Security</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  balanceBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  balanceBarFill: {
    height: '100%',
  },
  balanceCounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskCard: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  partnerTaskCard: {
    backgroundColor: '#fae8ff',
    borderLeftColor: '#c026d3',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  taskFrequency: {
    fontSize: 12,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statValueGood: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
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
  memberInfo: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  memberCards: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  navTextActive: {
    color: '#dc2626',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});
