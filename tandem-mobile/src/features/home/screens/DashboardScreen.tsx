import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import Swiper from 'react-native-deck-swiper';

export const DashboardScreen: React.FC = () => {
  const [showFilters, setShowFilters] = React.useState(false);
  const [showShuffleModal, setShowShuffleModal] = React.useState(false);
  const [showSwipeMode, setShowSwipeMode] = React.useState(false);
  const [showAddCard, setShowAddCard] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [shuffledCards, setShuffledCards] = React.useState<Array<{ name: string, owner: string }>>([]);
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>(['Savannah']);
  const swiperRef = React.useRef<Swiper<{ name: string, owner: string }>>(null);

  const allCards = [
    { name: 'Daily Tidying', owner: 'Savannah' },
    { name: 'Laundry', owner: 'Savannah' },
    { name: 'Meal Planning', owner: 'Savannah' },
    { name: 'Grocery Shopping', owner: 'Savannah' },
    { name: 'Morning Routine', owner: 'Savannah' },
    { name: 'School Communication', owner: 'Savannah' },
    { name: 'Dishes & Kitchen Cleanup', owner: 'Kevin' },
    { name: 'Deep Cleaning', owner: 'Kevin' },
    { name: 'Trash & Recycling', owner: 'Kevin' },
    { name: 'Yard Work', owner: 'Kevin' },
    { name: 'Car Care', owner: 'Kevin' },
    { name: 'Dinner', owner: 'Kevin' },
    { name: 'Bedtime Routine', owner: 'Kevin' },
    { name: 'Kid Activities', owner: 'Kevin' },
  ];

  const togglePerson = (person: string) => {
    setSelectedPeople(prev =>
      prev.includes(person)
        ? prev.filter(p => p !== person)
        : [...prev, person]
    );
  };

  const filteredCards = allCards.filter(card =>
    selectedPeople.includes(card.owner)
  );

  const handleSwipeLeft = (cardIndex: number) => {
    // Swipe left - assign to Savannah
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: 'Savannah' };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);

    // Check if all cards are done
    if (cardIndex >= shuffledCards.length - 1) {
      finishShuffle(updatedCards);
    }
  };

  const handleSwipeRight = (cardIndex: number) => {
    // Swipe right - assign to Kevin
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: 'Kevin' };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);

    // Check if all cards are done
    if (cardIndex >= shuffledCards.length - 1) {
      finishShuffle(updatedCards);
    }
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
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>



      {/* Expandable Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>People</Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => togglePerson('Savannah')}
            >
              <View style={styles.checkbox}>
                {selectedPeople.includes('Savannah') && (
                  <View style={styles.checkboxChecked} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Savannah</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => togglePerson('Kevin')}
            >
              <View style={styles.checkbox}>
                {selectedPeople.includes('Kevin') && (
                  <View style={[styles.checkboxChecked, { backgroundColor: '#c026d3' }]} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Kevin</Text>
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
              <Text style={styles.balanceStatLabel}>Savannah</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={[styles.balanceStatValue, { color: '#c026d3' }]}>8</Text>
              <Text style={styles.balanceStatLabel}>Kevin</Text>
            </View>
          </View>
        </View>
      )}

      {/* Cards List */}
      {filteredCards.length > 0 ? (
        <>
          {filteredCards.map((card, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.taskCard,
                card.owner === 'Kevin' && styles.partnerTaskCard
              ]}
              onPress={() => setSelectedCard(card.name)}
            >
              <View style={styles.taskCardContent}>
                <Text style={styles.taskName}>{card.name}</Text>
              </View>
              {selectedPeople.length > 1 && (
                <View style={styles.taskCardOwner}>
                  <View style={[
                    styles.ownerAvatar,
                    card.owner === 'Kevin' && styles.ownerAvatarKevin
                  ]}>
                    <Text style={styles.ownerAvatarText}>
                      {card.owner === 'Savannah' ? 'S' : 'M'}
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
              Redistribute cards between Savannah and Kevin to create a more balanced household.
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
                Swipe left for Savannah, right for Kevin
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
              {currentCardIndex} / {shuffledCards.length}
            </Text>
          </View>

          {/* Instructions */}
          <View style={styles.swipeInstructions}>
            <View style={styles.swipeInstructionItem}>
              <Text style={styles.swipeInstructionArrow}>←</Text>
              <Text style={styles.swipeInstructionText}>Savannah</Text>
            </View>
            <View style={styles.swipeInstructionItem}>
              <Text style={styles.swipeInstructionText}>Kevin</Text>
              <Text style={styles.swipeInstructionArrow}>→</Text>
            </View>
          </View>

          {/* Card Stack with Swiper */}
          <View style={styles.cardStack}>
            {shuffledCards.length > 0 && (
              <Swiper
                ref={swiperRef}
                cards={shuffledCards}
                renderCard={(card) => (
                  <View style={styles.swipeCard}>
                    <View style={styles.swipeCardContent}>
                      <Text style={styles.swipeCardTitle}>
                        {card.name}
                      </Text>
                    </View>
                  </View>
                )}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={() => {
                  finishShuffle(shuffledCards);
                }}
                cardIndex={0}
                backgroundColor="transparent"
                stackSize={2}
                stackScale={5}
                stackSeparation={15}
                disableTopSwipe
                disableBottomSwipe
                verticalSwipe={false}
                cardVerticalMargin={100}
                cardHorizontalMargin={30}
                overlayLabels={{
                  left: {
                    title: 'SAVANNAH',
                    style: {
                      label: {
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        fontFamily: 'New York',
                        fontSize: 18,
                        fontWeight: 'bold',
                        borderRadius: 8,
                        padding: 10,
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: -30,
                      }
                    }
                  },
                  right: {
                    title: 'KEVIN',
                    style: {
                      label: {
                        backgroundColor: '#c026d3',
                        color: '#ffffff',
                        fontFamily: 'New York',
                        fontSize: 18,
                        fontWeight: 'bold',
                        borderRadius: 8,
                        padding: 10,
                      },
                      wrapper: {
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginTop: 30,
                        marginLeft: 30,
                      }
                    }
                  }
                }}
                animateOverlayLabelsOpacity
                animateCardOpacity

              />
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.swipeCancelButton}
            onPress={() => {
              setShowSwipeMode(false);
              setCurrentCardIndex(0);
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
  const [selectedOwner, setSelectedOwner] = React.useState<'Savannah' | 'Kevin'>('Savannah');

  const handleAddCard = () => {
    if (!cardName.trim()) {
      Alert.alert('Missing Information', 'Please enter a card name.');
      return;
    }

    Alert.alert(
      'Card Added!',
      `"${cardName}" has been added to ${selectedOwner}'s cards.`,
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
                    selectedOwner !== 'Savannah' && styles.ownerButtonInactive
                  ]}
                  onPress={() => setSelectedOwner('Savannah')}
                >
                  <Text style={[
                    styles.ownerButtonText,
                    selectedOwner !== 'Savannah' && styles.ownerButtonTextInactive
                  ]}>
                    Savannah
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ownerButton,
                    selectedOwner !== 'Kevin' && styles.ownerButtonInactive
                  ]}
                  onPress={() => setSelectedOwner('Kevin')}
                >
                  <Text style={[
                    styles.ownerButtonText,
                    selectedOwner !== 'Kevin' && styles.ownerButtonTextInactive
                  ]}>
                    Kevin
                  </Text>
                </TouchableOpacity>
              </View>
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
  const [selectedOwner, setSelectedOwner] = React.useState<'Savannah' | 'Kevin'>('Savannah');
  const [notes, setNotes] = React.useState('');

  const handleSave = () => {
    Alert.alert(
      'Card Updated!',
      `"${cardName}" has been updated.\n\nOwner: ${selectedOwner}`,
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
                    selectedOwner !== 'Savannah' && styles.ownerButtonInactive
                  ]}
                  onPress={() => setSelectedOwner('Savannah')}
                >
                  <Text style={[
                    styles.ownerButtonText,
                    selectedOwner !== 'Savannah' && styles.ownerButtonTextInactive
                  ]}>
                    Savannah
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ownerButton,
                    selectedOwner !== 'Kevin' && styles.ownerButtonInactive
                  ]}
                  onPress={() => setSelectedOwner('Kevin')}
                >
                  <Text style={[
                    styles.ownerButtonText,
                    selectedOwner !== 'Kevin' && styles.ownerButtonTextInactive
                  ]}>
                    Kevin
                  </Text>
                </TouchableOpacity>
              </View>
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  tasksButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksButtonText: {
    fontFamily: 'New York',
    fontSize: 14,
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 15,
    color: '#111827',
  },
  sortMenuItemTextActive: {
    fontWeight: '600',
    color: '#dc2626',
  },
  sortCheckmark: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  balanceSubtitle: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
  },
  balanceStatLabel: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskCategory: {
    fontFamily: 'New York',
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
  ownerAvatarKevin: {
    backgroundColor: '#c026d3',
  },
  ownerAvatarText: {
    color: '#ffffff',
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    fontFamily: 'New York',
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
    lineHeight: 28,
  },
  modalDescription: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  modalOptionDescription: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  swipeContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  swipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  swipeTitle: {
    fontFamily: 'New York',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  swipeProgress: {
    fontFamily: 'New York',
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  swipeInstructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  swipeInstructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  swipeInstructionArrow: {
    fontFamily: 'New York',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  swipeInstructionText: {
    fontFamily: 'New York',
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
    height: 250,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  swipeCardBehind: {
    opacity: 0.5,
    transform: [{ scale: 0.95 }],
  },
  swipeCardContent: {
    alignItems: 'center',
  },
  swipeCardTitle: {
    fontFamily: 'New York',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  swipeCardCategory: {
    fontFamily: 'New York',
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
  },
  swipeCardFrequency: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 32,
  },
  cardTitleInput: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 14,
    color: '#111827',
  },
  pickerCheckmark: {
    fontFamily: 'New York',
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
    fontFamily: 'New York',
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
    fontFamily: 'New York',
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
