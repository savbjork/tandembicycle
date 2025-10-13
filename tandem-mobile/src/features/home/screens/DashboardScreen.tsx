import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';

export const DashboardScreen: React.FC = () => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showShuffleModal, setShowShuffleModal] = React.useState(false);
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>(['Sarah']); 
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([
    'Home Care', 'Food & Meals', 'Childcare'
  ]);
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
    <ScrollView style={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.screenTitle}>Cards</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addCardButtonSmall}
            onPress={() => {}}
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
      
      {/* Balance Meter */}
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
        <>
          {sortedCards.map((card, i) => (
            <TouchableOpacity 
              key={i} 
              style={[
                styles.taskCard, 
                card.owner === 'Mike' && styles.partnerTaskCard
              ]}
              onPress={() => {}}
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
          ))}
          
          {/* Shuffle Cards Button */}
          {selectedPeople.length === 2 && (
            <TouchableOpacity 
              style={styles.shuffleButton}
              onPress={() => setShowShuffleModal(true)}
            >
              <Text style={styles.shuffleButtonText}>Shuffle Cards</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyState}>No cards match your filters</Text>
        </View>
      )}

      {/* Shuffle Modal */}
      <Modal
        visible={showShuffleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShuffleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shuffle Cards</Text>
              <TouchableOpacity onPress={() => setShowShuffleModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Redistribute cards between Sarah and Mike to create a more balanced household.
            </Text>

            <TouchableOpacity 
              style={styles.modalOptionButton}
              onPress={() => {
                setShowShuffleModal(false);
                // TODO: Implement start from scratch
                console.log('Start from scratch');
              }}
            >
              <Text style={styles.modalOptionTitle}>🎲 Start From Scratch</Text>
              <Text style={styles.modalOptionDescription}>
                Randomly redistribute all cards between both people
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalOptionButton}
              onPress={() => {
                setShowShuffleModal(false);
                // TODO: Implement use existing cards
                console.log('Use existing cards');
              }}
            >
              <Text style={styles.modalOptionTitle}>♻️ Use Existing Cards</Text>
              <Text style={styles.modalOptionDescription}>
                Keep current assignments and shuffle only to balance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowShuffleModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
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
  taskCategory: {
    fontSize: 13,
    color: '#9ca3af',
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
  shuffleButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shuffleButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
    lineHeight: 28,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalOptionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  modalOptionDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
