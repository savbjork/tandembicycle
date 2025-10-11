import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * Fair Play App - Demo Version
 * Showing full UI with mock data (no complex navigation for now)
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = React.useState<'home' | 'profile'>('home');
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);
  const [showAddCard, setShowAddCard] = React.useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Fair Play</Text>
            <Text style={styles.headerSubtitle}>The Johnson Family</Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {currentScreen === 'home' && (
            <HomeScreen 
              onEditCard={setSelectedCard} 
              onAddCard={() => setShowAddCard(true)}
            />
          )}
          {currentScreen === 'profile' && <ProfileScreen />}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('home')}
          >
            <Text style={[styles.navText, currentScreen === 'home' && styles.navTextActive]}>
              Home
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => setCurrentScreen('profile')}
          >
            <Text style={[styles.navText, currentScreen === 'profile' && styles.navTextActive]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Modals - Rendered outside SafeAreaView for proper positioning */}
      {selectedCard && (
        <CardEditModal 
          cardName={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
      {showAddCard && (
        <AddCardModal onClose={() => setShowAddCard(false)} />
      )}
    </SafeAreaProvider>
  );
}

// Home Screen
interface HomeScreenProps {
  onEditCard: (cardName: string) => void;
  onAddCard: () => void;
}

function HomeScreen({ onEditCard, onAddCard }: HomeScreenProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>(['Sarah']); // Default to current user
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([
    'Home Care', 'Food & Meals', 'Childcare'
  ]); // All categories by default
  const [sortBy, setSortBy] = React.useState<'category' | 'person' | 'name'>('category');
  
  const allCards = [
    { name: 'Daily Tidying', owner: 'Sarah', frequency: 'Daily', category: 'Home Care' },
    { name: 'Laundry', owner: 'Sarah', frequency: 'Weekly', category: 'Home Care' },
    { name: 'Meal Planning', owner: 'Sarah', frequency: 'Weekly', category: 'Food & Meals' },
    { name: 'Grocery Shopping', owner: 'Sarah', frequency: 'Weekly', category: 'Food & Meals' },
    { name: 'Morning Routine', owner: 'Sarah', frequency: 'Daily', category: 'Childcare' },
    { name: 'School Communication', owner: 'Sarah', frequency: 'As-Needed', category: 'Childcare' },
    { name: 'Dishes & Kitchen Cleanup', owner: 'Mike', frequency: 'Daily', category: 'Home Care' },
    { name: 'Deep Cleaning', owner: 'Mike', frequency: 'Weekly', category: 'Home Care' },
    { name: 'Trash & Recycling', owner: 'Mike', frequency: 'Weekly', category: 'Home Care' },
    { name: 'Yard Work', owner: 'Mike', frequency: 'Monthly', category: 'Home Care' },
    { name: 'Car Care', owner: 'Mike', frequency: 'Monthly', category: 'Home Care' },
    { name: 'Dinner', owner: 'Mike', frequency: 'Daily', category: 'Food & Meals' },
    { name: 'Bedtime Routine', owner: 'Mike', frequency: 'Daily', category: 'Childcare' },
    { name: 'Kid Activities', owner: 'Mike', frequency: 'Weekly', category: 'Childcare' },
  ];

  const togglePerson = (person: string) => {
    setSelectedPeople(prev => 
      prev.includes(person) 
        ? prev.filter(p => p !== person)
        : [...prev, person]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredCards = allCards.filter(card => 
    selectedPeople.includes(card.owner) && selectedCategories.includes(card.category)
  );

  // Sort cards based on selected sort option
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortBy === 'category') {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'person') {
      if (a.owner !== b.owner) {
        return a.owner.localeCompare(b.owner);
      }
      return a.name.localeCompare(b.name);
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.screenTitle}>Cards</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addCardButtonSmall}
            onPress={onAddCard}
          >
            <Text style={styles.filterToggleText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={styles.sortButtonText}>A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={styles.sortMenu}>
          <Text style={styles.sortMenuTitle}>Sort By</Text>
          <TouchableOpacity 
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('category');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuItemText, sortBy === 'category' && styles.sortMenuItemTextActive]}>
              Category
            </Text>
            {sortBy === 'category' && <Text style={styles.sortCheckmark}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('person');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuItemText, sortBy === 'person' && styles.sortMenuItemTextActive]}>
              Person
            </Text>
            {sortBy === 'person' && <Text style={styles.sortCheckmark}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortMenuItem}
            onPress={() => {
              setSortBy('name');
              setShowSortMenu(false);
            }}
          >
            <Text style={[styles.sortMenuItemText, sortBy === 'name' && styles.sortMenuItemTextActive]}>
              Name
            </Text>
            {sortBy === 'name' && <Text style={styles.sortCheckmark}>✓</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* Expandable Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>People</Text>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => togglePerson('Sarah')}
            >
              <View style={styles.checkbox}>
                {selectedPeople.includes('Sarah') && (
                  <View style={styles.checkboxChecked} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Sarah</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => togglePerson('Mike')}
            >
              <View style={styles.checkbox}>
                {selectedPeople.includes('Mike') && (
                  <View style={[styles.checkboxChecked, { backgroundColor: '#c026d3' }]} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Mike</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Categories</Text>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleCategory('Home Care')}
            >
              <View style={styles.checkbox}>
                {selectedCategories.includes('Home Care') && (
                  <View style={styles.checkboxChecked} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Home Care</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleCategory('Food & Meals')}
            >
              <View style={styles.checkbox}>
                {selectedCategories.includes('Food & Meals') && (
                  <View style={styles.checkboxChecked} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Food & Meals</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => toggleCategory('Childcare')}
            >
              <View style={styles.checkbox}>
                {selectedCategories.includes('Childcare') && (
                  <View style={styles.checkboxChecked} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Childcare</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Balance Meter - Only show when viewing all people */}
      {selectedPeople.length === 2 && (
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceTitle}>Balance</Text>
              <Text style={styles.balanceSubtitle}>14 cards total</Text>
            </View>
          </View>
          
          <View style={styles.balanceBar}>
            <View style={[styles.balanceBarFill, { width: '43%', backgroundColor: '#dc2626' }]} />
            <View style={[styles.balanceBarFill, { width: '57%', backgroundColor: '#c026d3' }]} />
          </View>
          
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>6</Text>
              <Text style={styles.balanceStatLabel}>Sarah</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceStatValue, { color: '#c026d3' }]}>8</Text>
              <Text style={styles.balanceStatLabel}>Mike</Text>
            </View>
          </View>
        </View>
      )}

      {/* Cards List */}
      {sortedCards.length > 0 ? (
        sortedCards.map((card, i) => (
          <TouchableOpacity 
            key={i} 
            style={[
              styles.taskCard, 
              card.owner === 'Mike' && styles.partnerTaskCard
            ]}
            onPress={() => onEditCard(card.name)}
          >
            <View style={styles.taskCardContent}>
              <Text style={styles.taskName}>{card.name}</Text>
              <Text style={styles.taskCategory}>{card.category} • {card.frequency}</Text>
            </View>
            {selectedPeople.length > 1 && (
              <View style={styles.taskCardOwner}>
                <View style={[
                  styles.ownerAvatar,
                  card.owner === 'Mike' && styles.ownerAvatarMike
                ]}>
                  <Text style={styles.ownerAvatarText}>
                    {card.owner === 'Sarah' ? 'S' : 'M'}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyState}>No cards match your filters</Text>
        </View>
      )}
    </View>
  );
}

// Card Edit Modal
interface CardEditModalProps {
  cardName: string;
  onClose: () => void;
}

function CardEditModal({ cardName, onClose }: CardEditModalProps) {
  return (
    <View style={styles.modalOverlay}>
      <ScrollView contentContainerStyle={styles.modalScrollContent}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Card</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.cardTitleLarge}>{cardName}</Text>
          
          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Owner</Text>
            <View style={styles.ownerButtons}>
              <TouchableOpacity style={styles.ownerButton}>
                <Text style={styles.ownerButtonText}>Sarah</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ownerButton, styles.ownerButtonInactive]}>
                <Text style={styles.ownerButtonTextInactive}>Mike</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Frequency</Text>
            <TouchableOpacity style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>Weekly</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Category</Text>
            <TouchableOpacity style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>Home Care</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Notes</Text>
            <TextInput
              style={styles.textInputMultiline}
              placeholder="Add notes..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Add Card Modal
interface AddCardModalProps {
  onClose: () => void;
}

function AddCardModal({ onClose }: AddCardModalProps) {
  const [cardName, setCardName] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<'Sarah' | 'Mike'>('Sarah');
  const [showFrequencyPicker, setShowFrequencyPicker] = React.useState(false);
  const [selectedFrequency, setSelectedFrequency] = React.useState('');
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('');

  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Seasonal', 'As-Needed'];
  const categories = ['Home Care', 'Food & Meals', 'Childcare', 'Financial', 'Social & Family', 'Personal Care'];

  const handleAddCard = () => {
    if (!cardName.trim()) {
      Alert.alert('Missing Information', 'Please enter a card name.');
      return;
    }
    if (!selectedFrequency) {
      Alert.alert('Missing Information', 'Please select a frequency.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Missing Information', 'Please select a category.');
      return;
    }

    Alert.alert(
      'Card Added!',
      `"${cardName}" has been added to ${selectedOwner}'s cards.\n\nFrequency: ${selectedFrequency}\nCategory: ${selectedCategory}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <View style={styles.modalOverlay}>
      <ScrollView contentContainerStyle={styles.modalScrollContent}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Card</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.cardTitleInput}
            placeholder="Card Name"
            placeholderTextColor="#9ca3af"
            value={cardName}
            onChangeText={setCardName}
            autoFocus
          />

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Owner</Text>
            <View style={styles.ownerButtons}>
              <TouchableOpacity 
                style={[
                  styles.ownerButton,
                  selectedOwner !== 'Sarah' && styles.ownerButtonInactive
                ]}
                onPress={() => setSelectedOwner('Sarah')}
              >
                <Text style={[
                  styles.ownerButtonText,
                  selectedOwner !== 'Sarah' && styles.ownerButtonTextInactive
                ]}>
                  Sarah
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.ownerButton,
                  selectedOwner !== 'Mike' && styles.ownerButtonInactive
                ]}
                onPress={() => setSelectedOwner('Mike')}
              >
                <Text style={[
                  styles.ownerButtonText,
                  selectedOwner !== 'Mike' && styles.ownerButtonTextInactive
                ]}>
                  Mike
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Frequency</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
            >
              <Text style={[
                styles.dropdownButtonText,
                !selectedFrequency && styles.dropdownPlaceholder
              ]}>
                {selectedFrequency || 'Select frequency...'}
              </Text>
            </TouchableOpacity>
            {showFrequencyPicker && (
              <View style={styles.pickerOptions}>
                {frequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={styles.pickerOption}
                    onPress={() => {
                      setSelectedFrequency(freq);
                      setShowFrequencyPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{freq}</Text>
                    {selectedFrequency === freq && (
                      <Text style={styles.pickerCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Category</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[
                styles.dropdownButtonText,
                !selectedCategory && styles.dropdownPlaceholder
              ]}>
                {selectedCategory || 'Select category...'}
              </Text>
            </TouchableOpacity>
            {showCategoryPicker && (
              <View style={styles.pickerOptions}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.pickerOption}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{cat}</Text>
                    {selectedCategory === cat && (
                      <Text style={styles.pickerCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalLabel}>Notes</Text>
            <TextInput
              style={styles.textInputMultiline}
              placeholder="Add notes..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
              <Text style={styles.saveButtonText}>Add Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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

      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
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
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  balanceSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  balanceBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
  },
  balanceBarFill: {
    height: '100%',
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceStat: {
    alignItems: 'center',
  },
  balanceStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
  },
  balanceStatLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  partnerTaskCard: {
    backgroundColor: '#ffffff',
  },
  taskName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskFrequency: {
    fontSize: 12,
    color: '#9ca3af',
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
    borderTopColor: '#f0f0f0',
    paddingVertical: 12,
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navTextActive: {
    color: '#dc2626',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  addCardButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  sortMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sortMenuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sortMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sortMenuItemText: {
    fontSize: 15,
    color: '#111827',
  },
  sortMenuItemTextActive: {
    fontWeight: '600',
    color: '#dc2626',
  },
  sortCheckmark: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  filterPanel: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: '#dc2626',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#111827',
  },
  emptyStateContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyState: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardOwner: {
    marginLeft: 12,
  },
  ownerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerAvatarMike: {
    backgroundColor: '#c026d3',
  },
  ownerAvatarText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  taskOwner: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280',
  },
  taskCategory: {
    fontSize: 13,
    color: '#9ca3af',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    minWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  cardTitleLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
  },
  cardTitleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalSection: {
    marginBottom: 28,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ownerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ownerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  ownerButtonInactive: {
    backgroundColor: '#f3f4f6',
  },
  ownerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  ownerButtonTextInactive: {
    color: '#6b7280',
  },
  dropdownButton: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9ca3af',
  },
  textInput: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
  },
  textInputPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
  },
  textInputField: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    color: '#111827',
  },
  textInputMultiline: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  pickerCheckmark: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
