import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text } from '@shared/components/ui/Text';
import { TextInput } from '@shared/components/ui/TextInput';
import Swiper from 'react-native-deck-swiper';
import { COLORS } from '@shared/constants/colors';

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
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: 'Savannah' };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);
    if (cardIndex >= shuffledCards.length - 1) {
      finishShuffle(updatedCards);
    }
  };

  const handleSwipeRight = (cardIndex: number) => {
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: 'Kevin' };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);
    if (cardIndex >= shuffledCards.length - 1) {
      finishShuffle(updatedCards);
    }
  };

  const finishShuffle = (updatedCards: typeof shuffledCards) => {
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
    <ScrollView className="flex-1 px-5 pt-5 pb-5 bg-surface-dim">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text tracking-tight">
            Cards
          </Text>
        </View>
        <View className="flex-row gap-2 mt-1">
          <TouchableOpacity
            className="w-10 h-10 rounded-lg bg-primary-600 justify-center items-center"
            onPress={() => setShowAddCard(true)}
          >
            <Text className="text-xl font-semibold text-white">+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-10 h-10 rounded-lg bg-primary-600 justify-center items-center"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text className="text-xl font-semibold text-white">☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <View className="bg-surface rounded-xl p-5 mb-6 border border-border-light shadow-sm">
          <View className="mb-5">
            <Text className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              People
            </Text>
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => togglePerson('Savannah')}
            >
              <View className="w-5 h-5 rounded border-2 border-border-strong mr-3 justify-center items-center">
                {selectedPeople.includes('Savannah') && (
                  <View className="w-3 h-3 rounded-sm bg-primary-600" />
                )}
              </View>
              <Text className="text-[15px] text-text">Savannah</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center py-2"
              onPress={() => togglePerson('Kevin')}
            >
              <View className="w-5 h-5 rounded border-2 border-border-strong mr-3 justify-center items-center">
                {selectedPeople.includes('Kevin') && (
                  <View className="w-3 h-3 rounded-sm bg-secondary-600" />
                )}
              </View>
              <Text className="text-[15px] text-text">Kevin</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Balance Meter */}
      {selectedPeople.length === 2 && (
        <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-base font-semibold text-text">
                Balance
              </Text>
              <Text className="text-[13px] text-text-secondary mt-0.5">
                14 cards total
              </Text>
            </View>
          </View>

          <View className="h-2 bg-border-muted rounded-full flex-row overflow-hidden mb-4">
            <View className="h-full bg-primary-600" style={{ width: '43%' }} />
            <View className="h-full bg-secondary-600" style={{ width: '57%' }} />
          </View>

          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600">
                6
              </Text>
              <Text className="text-[13px] text-text-secondary mt-1">
                Savannah
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-secondary-600">
                8
              </Text>
              <Text className="text-[13px] text-text-secondary mt-1">
                Kevin
              </Text>
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
              className="bg-surface p-4 rounded-xl mb-3 flex-row justify-between items-center border border-border-light shadow-sm"
              onPress={() => setSelectedCard(card.name)}
            >
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-text mb-1">
                  {card.name}
                </Text>
              </View>
              {selectedPeople.length > 1 && (
                <View className="ml-3">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${card.owner === 'Kevin' ? 'bg-secondary-600' : 'bg-primary-600'
                      }`}
                  >
                    <Text className="text-white text-[13px] font-semibold">
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
              className="bg-primary-600 rounded-xl py-4 px-6 mb-6 items-center shadow-md"
              onPress={() => setShowShuffleModal(true)}
            >
              <Text className="text-lg font-bold text-white tracking-tight">
                Shuffle Cards
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View className="bg-surface rounded-xl p-10 items-center mt-5">
          <Text className="text-sm text-text-muted text-center">
            No cards match your filters
          </Text>
        </View>
      )}

      {/* Shuffle Modal */}
      <Modal
        visible={showShuffleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShuffleModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-surface rounded-2xl p-6 w-[90%] max-h-[80%] shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[22px] font-bold text-text">
                Shuffle Cards
              </Text>
              <TouchableOpacity onPress={() => setShowShuffleModal(false)}>
                <Text className="text-[28px] text-text-secondary font-light leading-7">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-text-secondary mb-6 leading-5">
              Redistribute cards between Savannah and Kevin to create a more
              balanced household.
            </Text>

            <TouchableOpacity
              className="bg-surface-muted border-2 border-border rounded-xl p-4 mb-3"
              onPress={() => {
                setShowShuffleModal(false);
                console.log('Start from scratch');
              }}
            >
              <Text className="text-base font-semibold text-text mb-1.5">
                🎲 Start From Scratch
              </Text>
              <Text className="text-[13px] text-text-secondary leading-[18px]">
                Randomly redistribute all cards between both people
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface-muted border-2 border-border rounded-xl p-4 mb-3"
              onPress={startSwipeShuffle}
            >
              <Text className="text-base font-semibold text-text mb-1.5">
                ♻️ Use Existing Cards
              </Text>
              <Text className="text-[13px] text-text-secondary leading-[18px]">
                Swipe left for Savannah, right for Kevin
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface border-2 border-border rounded-xl py-3 mt-2 items-center"
              onPress={() => setShowShuffleModal(false)}
            >
              <Text className="text-base font-semibold text-text-secondary">
                Cancel
              </Text>
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
        <View className="flex-1 bg-surface-dim pt-10 pb-[30px] px-5">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-text">
              Assign Cards
            </Text>
            <Text className="text-lg font-semibold text-text-secondary">
              {currentCardIndex} / {shuffledCards.length}
            </Text>
          </View>

          {/* Instructions */}
          <View className="flex-row justify-between mb-5 px-5">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-primary-600">
                ←
              </Text>
              <Text className="text-base font-semibold text-text">
                Savannah
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-text">
                Kevin
              </Text>
              <Text className="text-2xl font-bold text-primary-600">
                →
              </Text>
            </View>
          </View>

          {/* Card Stack with Swiper */}
          <View className="flex-1 justify-center items-center relative">
            {shuffledCards.length > 0 && (
              <Swiper
                ref={swiperRef}
                cards={shuffledCards}
                renderCard={(card) => (
                  <View className="h-[250px] w-full bg-surface rounded-2xl p-5 justify-center items-center shadow-lg">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-text text-center mb-4">
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
                        backgroundColor: COLORS.primary[600],
                        color: COLORS.white,
                        fontFamily: 'Barriecito-Regular',
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
                      },
                    },
                  },
                  right: {
                    title: 'KEVIN',
                    style: {
                      label: {
                        backgroundColor: COLORS.secondary[600],
                        color: COLORS.white,
                        fontFamily: 'Barriecito-Regular',
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
                      },
                    },
                  },
                }}
                animateOverlayLabelsOpacity
                animateCardOpacity
              />
            )}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            className="bg-surface border-2 border-border rounded-xl py-3.5 items-center mt-5"
            onPress={() => {
              setShowSwipeMode(false);
              setCurrentCardIndex(0);
            }}
          >
            <Text className="text-base font-semibold text-text-secondary">
              Cancel
            </Text>
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

// ─── Add Card Modal ───────────────────────────────────────────────────────────

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
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-surface rounded-2xl p-6 w-[90%] max-h-[80%] shadow-lg">
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[22px] font-bold text-text">
                Add New Card
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-[28px] text-text-secondary font-light leading-7">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="text-[22px] font-bold text-text mb-8 py-3.5 px-4 rounded-xl bg-surface-muted border border-border"
              placeholder="Card Name"
              value={cardName}
              onChangeText={setCardName}
              autoFocus
            />

            <View className="mb-7">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-[10px] items-center ${selectedOwner === 'Savannah' ? 'bg-primary-600' : 'bg-surface-hover'
                    }`}
                  onPress={() => setSelectedOwner('Savannah')}
                >
                  <Text
                    className={`text-base font-semibold ${selectedOwner === 'Savannah' ? 'text-white' : 'text-text-secondary'
                      }`}
                  >
                    Savannah
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-[10px] items-center ${selectedOwner === 'Kevin' ? 'bg-primary-600' : 'bg-surface-hover'
                    }`}
                  onPress={() => setSelectedOwner('Kevin')}
                >
                  <Text
                    className={`text-base font-semibold ${selectedOwner === 'Kevin' ? 'text-white' : 'text-text-secondary'
                      }`}
                  >
                    Kevin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                className="flex-1 py-4 rounded-[10px] bg-surface border-2 border-border items-center"
                onPress={onClose}
              >
                <Text className="text-base font-semibold text-text-secondary">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-[10px] bg-primary-600 items-center"
                onPress={handleAddCard}
              >
                <Text className="text-base font-semibold text-white">
                  Add Card
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ─── Edit Card Modal ──────────────────────────────────────────────────────────

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
          },
        },
      ]
    );
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="bg-surface rounded-2xl p-6 w-[90%] max-h-[80%] shadow-lg">
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={onClose}>
                <Text className="text-[28px] text-text-secondary font-light leading-7">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-[26px] font-bold text-text mb-8">
              {cardName}
            </Text>

            <View className="mb-7">
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-[10px] items-center ${selectedOwner === 'Savannah' ? 'bg-primary-600' : 'bg-surface-hover'
                    }`}
                  onPress={() => setSelectedOwner('Savannah')}
                >
                  <Text
                    className={`text-base font-semibold ${selectedOwner === 'Savannah' ? 'text-white' : 'text-text-secondary'
                      }`}
                  >
                    Savannah
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-[10px] items-center ${selectedOwner === 'Kevin' ? 'bg-primary-600' : 'bg-surface-hover'
                    }`}
                  onPress={() => setSelectedOwner('Kevin')}
                >
                  <Text
                    className={`text-base font-semibold ${selectedOwner === 'Kevin' ? 'text-white' : 'text-text-secondary'
                      }`}
                  >
                    Kevin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-7">
              <TextInput
                className="py-3.5 px-[18px] rounded-[10px] bg-surface-muted border border-border text-base text-text min-h-[100px]"
                placeholder="Add notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            <View className="flex-row gap-3 mt-8">
              <TouchableOpacity
                className="flex-1 py-4 rounded-[10px] bg-primary-50 items-center border border-primary-200"
                onPress={handleDelete}
              >
                <Text className="text-base font-semibold text-primary-600">
                  Delete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-[10px] bg-primary-600 items-center"
                onPress={handleSave}
              >
                <Text className="text-base font-semibold text-white">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
