import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, PanResponder, TextInput, Alert } from 'react-native';

export const DashboardScreen: React.FC = () => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const [showShuffleModal, setShowShuffleModal] = React.useState(false);
  const [showSwipeMode, setShowSwipeMode] = React.useState(false);
  const [showAddCard, setShowAddCard] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [shuffledCards, setShuffledCards] = React.useState<Array<{name: string, owner: string, frequency: string, category: string}>>([]);
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>(['Sarah']); 
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([
    'Home Care', 'Food & Meals', 'Childcare'
  ]);
  const [sortBy, setSortBy] = React.useState<'category' | 'person' | 'name'>('category');
  
  const pan = React.useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-30deg', '0deg', '30deg'],
  });
  
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

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          // Swipe right - assign to Mike
          handleSwipe('Mike');
        } else if (gesture.dx < -120) {
          // Swipe left - assign to Sarah
          handleSwipe('Sarah');
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = (owner: string) => {
    Animated.timing(pan, {
      toValue: { x: owner === 'Mike' ? 500 : -500, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Update the card owner
      const updatedCards = [...shuffledCards];
      updatedCards[currentCardIndex] = { ...updatedCards[currentCardIndex], owner };
      setShuffledCards(updatedCards);
      
      // Move to next card
      if (currentCardIndex < shuffledCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        pan.setValue({ x: 0, y: 0 });
      } else {
        // All cards done - apply changes
        finishShuffle(updatedCards);
      }
    });
  };

  const finishShuffle = (updatedCards: typeof shuffledCards) => {
    // TODO: Save the updated card assignments
    console.log('Shuffle complete:', updatedCards);
    setShowSwipeMode(false);
    setCurrentCardIndex(0);
  };

  const startSwipeShuffle = () => {
    setShowShuffleModal(false);
    setShuffledCards([...allCards]);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
  };

  return (
    <ScrollView style={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.screenTitle}>Cards</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.addCardButtonSmall}
            onPress={() => setShowAddCard(true)}
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
              onPress={() => setSelectedCard(card.name)}
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
              onPress={startSwipeShuffle}
            >
              <Text style={styles.modalOptionTitle}>♻️ Use Existing Cards</Text>
              <Text style={styles.modalOptionDescription}>
                Swipe left for Sarah, right for Mike
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

      {/* Swipe Mode Modal */}
      <Modal
        visible={showSwipeMode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSwipeMode(false)}
      >
        <View style={styles.swipeContainer}>
          {/* Header */}
          <View style={styles.swipeHeader}>
            <Text style={styles.swipeTitle}>Assign Cards</Text>
            <Text style={styles.swipeProgress}>
              {currentCardIndex + 1} / {shuffledCards.length}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.swipeInstructions}>
            <View style={styles.swipeInstructionItem}>
              <Text style={styles.swipeInstructionArrow}>←</Text>
              <Text style={styles.swipeInstructionText}>Sarah</Text>
            </View>
            <View style={styles.swipeInstructionItem}>
              <Text style={styles.swipeInstructionText}>Mike</Text>
              <Text style={styles.swipeInstructionArrow}>→</Text>
            </View>
          </View>

          {/* Card Stack */}
          <View style={styles.cardStack}>
            {shuffledCards.length > 0 && currentCardIndex < shuffledCards.length && (
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.swipeCard,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { rotate: rotate },
                    ],
                  },
                ]}
              >
                <View style={styles.swipeCardContent}>
                  <Text style={styles.swipeCardTitle}>
                    {shuffledCards[currentCardIndex].name}
                  </Text>
                  <Text style={styles.swipeCardCategory}>
                    {shuffledCards[currentCardIndex].category}
                  </Text>
                  <Text style={styles.swipeCardFrequency}>
                    {shuffledCards[currentCardIndex].frequency}
                  </Text>
                </View>

                {/* Swipe Indicators */}
                <Animated.View
                  style={[
                    styles.swipeIndicator,
                    styles.swipeIndicatorLeft,
                    {
                      opacity: pan.x.interpolate({
                        inputRange: [-200, -50, 0],
                        outputRange: [1, 0.5, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  <Text style={styles.swipeIndicatorText}>SARAH</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.swipeIndicator,
                    styles.swipeIndicatorRight,
                    {
                      opacity: pan.x.interpolate({
                        inputRange: [0, 50, 200],
                        outputRange: [0, 0.5, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                >
                  <Text style={styles.swipeIndicatorText}>MIKE</Text>
                </Animated.View>
              </Animated.View>
            )}

            {/* Next card preview */}
            {currentCardIndex + 1 < shuffledCards.length && (
              <View style={[styles.swipeCard, styles.swipeCardBehind]}>
                <View style={styles.swipeCardContent}>
                  <Text style={styles.swipeCardTitle}>
                    {shuffledCards[currentCardIndex + 1].name}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.swipeCancelButton}
            onPress={() => {
              setShowSwipeMode(false);
              setCurrentCardIndex(0);
              pan.setValue({ x: 0, y: 0 });
            }}
          >
            <Text style={styles.swipeCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Add Card Modal */}
      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}

      {/* Edit Card Modal */}
      {selectedCard && <CardEditModal cardName={selectedCard} onClose={() => setSelectedCard(null)} />}
      </ScrollView>
  );
};

// Add Card Modal Component
interface AddCardModalProps {
  onClose: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ onClose }) => {
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
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !selectedFrequency && styles.dropdownPlaceholder
                ]}>
                  {selectedFrequency || 'Select frequency'}
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
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !selectedCategory && styles.dropdownPlaceholder
                ]}>
                  {selectedCategory || 'Select category'}
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

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
                <Text style={styles.saveButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Edit Card Modal Component
interface CardEditModalProps {
  cardName: string;
  onClose: () => void;
}

const CardEditModal: React.FC<CardEditModalProps> = ({ cardName, onClose }) => {
  const [selectedOwner, setSelectedOwner] = React.useState<'Sarah' | 'Mike'>('Sarah');
  const [showFrequencyPicker, setShowFrequencyPicker] = React.useState(false);
  const [selectedFrequency, setSelectedFrequency] = React.useState('Weekly');
  const [showCategoryPicker, setShowCategoryPicker] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('Home Care');
  const [notes, setNotes] = React.useState('');

  const frequencies = ['Daily', 'Weekly', 'Monthly', 'Seasonal', 'As-Needed'];
  const categories = ['Home Care', 'Food & Meals', 'Childcare', 'Financial', 'Social & Family', 'Personal Care'];

  const handleSave = () => {
    Alert.alert(
      'Card Updated!',
      `"${cardName}" has been updated.\n\nOwner: ${selectedOwner}\nFrequency: ${selectedFrequency}\nCategory: ${selectedCategory}`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${cardName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Card Deleted', `"${cardName}" has been removed.`, [{ text: 'OK', onPress: onClose }]);
          }
        }
      ]
    );
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.cardTitleLarge}>{cardName}</Text>
            
            <View style={styles.modalSection}>
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
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
              >
                <Text style={styles.dropdownButtonText}>{selectedFrequency}</Text>
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
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
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
              <TextInput
                style={styles.textInputMultiline}
                placeholder="Add notes..."
                placeholderTextColor="#9ca3af"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
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
    width: '90%',
    maxHeight: '80%',
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
  swipeContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  swipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  swipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  swipeProgress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  swipeInstructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  swipeInstructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeInstructionArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  swipeInstructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardStack: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  swipeCard: {
    width: '90%',
    height: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
  },
  swipeCardBehind: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  swipeCardContent: {
    alignItems: 'center',
  },
  swipeCardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  swipeCardCategory: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  swipeCardFrequency: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  swipeIndicator: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 3,
  },
  swipeIndicatorLeft: {
    left: 40,
    borderColor: '#dc2626',
    transform: [{ rotate: '-20deg' }],
  },
  swipeIndicatorRight: {
    right: 40,
    borderColor: '#c026d3',
    transform: [{ rotate: '20deg' }],
  },
  swipeIndicatorText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  swipeCancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  swipeCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalScrollContent: {
    flexGrow: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
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
});
