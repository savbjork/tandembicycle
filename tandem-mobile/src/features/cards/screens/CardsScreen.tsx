import React from 'react';
import { View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Text, Button, BottomSheet, Checkbox } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { DoneButton } from '@shared/components/ui/HeaderButtons';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { fakeData, type Card, type Task } from '@shared/data/FakeDataStore';

import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CardsStackParamList, MainTabParamList } from '@app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaskRow } from '@shared/components/SwipeableTaskRow';

interface CardsScreenProps {
  onClose?: () => void;
}

type CardsFilter = 'all' | 'me';
type TaskTimeFilter = 'none' | 'week' | 'month' | 'year' | 'all';
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CardsStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export const CardsScreen: React.FC<CardsScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const [showShuffleModal, setShowShuffleModal] = React.useState(false);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [showSwipeMode, setShowSwipeMode] = React.useState(false);
  const [showAddCard, setShowAddCard] = React.useState(false);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [shuffledCards, setShuffledCards] = React.useState<Array<{ name: string, owner: string }>>([]);
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectedCardNames, setSelectedCardNames] = React.useState<string[]>([]);
  const [cards, setCards] = React.useState<Card[]>(fakeData.cards);
  const [tasks, setTasks] = React.useState<Task[]>(fakeData.tasks);
  const [filter, setFilter] = React.useState<CardsFilter>('all');
  const [taskTimeFilter, setTaskTimeFilter] = React.useState<TaskTimeFilter>('week');
  const [hideCompleted, setHideCompleted] = React.useState(false);
  const [hideUndated, setHideUndated] = React.useState(false);
  const swiperRef = React.useRef<Swiper<{ name: string, owner: string }>>(null);

  const selectedPerson = 'Savannah';

  const handleSwipeLeft = (cardIndex: number) => {
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: selectedPerson };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);
  };

  const handleSwipeRight = (cardIndex: number) => {
    const updatedCards = [...shuffledCards];
    updatedCards[cardIndex] = { ...updatedCards[cardIndex], owner: 'Kevin' };
    setShuffledCards(updatedCards);
    setCurrentCardIndex(cardIndex + 1);
  };

  const finishShuffle = (updatedCards: typeof shuffledCards) => {
    // Persistent state update (simulated for FakeDataStore)
    const newCards = [...cards];
    const newTasks = [...fakeData.tasks];

    updatedCards.forEach(updated => {
      const card = newCards.find(c => c.name === updated.name);
      if (card) {
        card.owner = updated.owner as any;

        // Also move all associated tasks to the new owner
        newTasks.forEach(task => {
          if (task.card === updated.name) {
            task.owner = updated.owner as any;
          }
        });
      }
    });

    // Update global store
    fakeData.cards = newCards;
    fakeData.tasks = newTasks;
    // Update local state to trigger re-render
    setCards(newCards);
    setTasks(newTasks);

    setShowSwipeMode(false);
    setCurrentCardIndex(0);
    setIsSelecting(false);
    setSelectedCardNames([]);
  };

  const startSwipeShuffle = (cardsToShuffle: Card[] = cards) => {
    setShowShuffleModal(false);
    setShuffledCards([...cardsToShuffle]);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
  };

  const toggleCardSelection = (name: string) => {
    setSelectedCardNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleFreshStart = () => {
    Alert.alert(
      'Fresh Start?',
      'This will delete ALL current cards and reset to a standard deck. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            const freshCards: Card[] = [
              { name: 'Daily Tidying', owner: selectedPerson },
              { name: 'Laundry', owner: selectedPerson },
              { name: 'Meal Planning', owner: selectedPerson },
              { name: 'Dishes', owner: 'Kevin' },
              { name: 'Yard Work', owner: 'Kevin' },
              { name: 'Dinner', owner: 'Kevin' },
            ];
            fakeData.cards = freshCards;
            fakeData.tasks = [
              { id: 't1', name: 'Wipe counters', card: 'Daily Tidying', owner: selectedPerson, dueDate: '2026-02-23', isDone: false },
              { id: 't4', name: 'Wash clothes', card: 'Laundry', owner: selectedPerson, dueDate: '2026-02-23', isDone: true },
            ];
            setCards(freshCards);
            setTasks(fakeData.tasks);
            setShowShuffleModal(false);
            Alert.alert('Reset Complete', 'Standard deck restored.');
          }
        }
      ]
    );
  };

  const handleSelectiveShuffle = () => {
    if (selectedCardNames.length === 0) {
      Alert.alert('No Cards Selected', 'Please select at least one card to reassign.');
      return;
    }
    const cardsToShuffle = cards.filter(c => selectedCardNames.includes(c.name));
    startSwipeShuffle(cardsToShuffle);
  };

  const handleToggleDone = (taskId: string, isDone: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone } : t));
    // Update global store too
    const task = fakeData.tasks.find(t => t.id === taskId);
    if (task) task.isDone = isDone;
  };

  const isTaskInTimeFrame = (task: Task) => {
    if (taskTimeFilter === 'all') return true;
    if (taskTimeFilter === 'none') return false;

    if (!task.dueDate) return !hideUndated;

    const taskDate = new Date(task.dueDate + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (taskTimeFilter === 'week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      return taskDate >= now && taskDate <= nextWeek;
    }
    if (taskTimeFilter === 'month') {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      return taskDate >= now && taskDate <= nextMonth;
    }
    if (taskTimeFilter === 'year') {
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);
      return taskDate >= now && taskDate <= nextYear;
    }
    return true;
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScrollView className="flex-1 px-5 pt-[60px] pb-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <View className="flex-1">
            <Text className="text-[32px] font-bold text-text tracking-tight">
              {isSelecting ? 'Select Cards' : 'Cards'}
            </Text>
          </View>
          <View className="flex-row gap-2 mt-1">
            {isSelecting ? (
              <TouchableOpacity
                onPress={() => {
                  setIsSelecting(false);
                  setSelectedCardNames([]);
                }}
                className="bg-surface px-4 py-2 rounded-full border border-border"
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row gap-2">
                {filter === 'all' && (
                  <TouchableOpacity
                    onPress={() => setShowShuffleModal(true)}
                    className="bg-surface w-10 h-10 rounded-full items-center justify-center border border-border"
                  >
                    <Ionicons name="shuffle" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setShowFilterMenu(true)}
                  className="bg-surface w-10 h-10 rounded-full items-center justify-center border border-border"
                >
                  <Ionicons name="options-outline" size={20} color={COLORS.text.secondary} />
                  {(filter !== 'all' || taskTimeFilter !== 'none') && (
                    <View className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-surface" />
                  )}
                </TouchableOpacity>
                <AddButton onPress={() => setShowAddCard(true)} />
                {onClose && <DoneButton onPress={onClose} />}
              </View>
            )}
          </View>
        </View>

        {/* Navigation Row */}
        {!isSelecting && (
          <View className="flex-row gap-2 mb-6">
            <TouchableOpacity
              onPress={() => navigation.navigate('MyBoard')}
              className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
            >
              <Ionicons name="list-outline" size={18} color={COLORS.text.secondary} />
              <Text className="text-text-secondary font-bold text-[15px]">Tasks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Inbox')}
              className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
            >
              <Ionicons name="mail-outline" size={18} color={COLORS.text.secondary} />
              <Text className="text-text-secondary font-bold text-[15px]">Inbox</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              className="flex-1 bg-surface h-11 rounded-2xl flex-row items-center justify-center gap-2 border border-border-light shadow-sm"
            >
              <Ionicons name="home-outline" size={18} color={COLORS.text.secondary} />
              <Text className="text-text-secondary font-bold text-[15px]">Home</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Balance Meter */}
        {!isSelecting && filter === 'all' && (
          <View className="bg-surface rounded-xl p-5 mb-6 shadow-sm">
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text className="text-base font-semibold text-text">
                  Balance
                </Text>
                <Text className="text-[13px] text-text-secondary mt-0.5">
                  {cards.length} cards total
                </Text>
              </View>
            </View>

            <View className="h-2 bg-border-muted rounded-full flex-row overflow-hidden mb-4">
              <View className="h-full bg-primary-600" style={{ width: `${(cards.filter((c: Card) => c.owner === 'Savannah').length / cards.length) * 100}%` }} />
              <View className="h-full bg-secondary-600" style={{ width: `${(cards.filter((c: Card) => c.owner === 'Kevin').length / cards.length) * 100}%` }} />
            </View>

            <View className="flex-row justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary-600">
                  {cards.filter((c: Card) => c.owner === 'Savannah').length}
                </Text>
                <Text className="text-[13px] text-text-secondary mt-1">
                  Savannah
                </Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-secondary-600">
                  {cards.filter((c: Card) => c.owner === 'Kevin').length}
                </Text>
                <Text className="text-[13px] text-text-secondary mt-1">
                  Kevin
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mb-6">
          {cards
            .filter((c: Card) => filter === 'all' ? true : c.owner === 'Savannah')
            .map((card: Card, i: number) => {
              const isSelected = selectedCardNames.includes(card.name);
              const cardTasks = tasks.filter((t: Task) =>
                t.card === card.name &&
                isTaskInTimeFrame(t) &&
                t.owner === 'Savannah' &&
                (!hideCompleted || !t.isDone)
              );

              return (
                <TouchableOpacity
                  key={i}
                  className={`bg-surface p-4 rounded-xl mb-3 border-[0.5px] shadow-sm ${isSelecting && isSelected ? 'border-primary-600' : 'border-border-light'
                    }`}
                  onPress={() => isSelecting ? toggleCardSelection(card.name) : navigation.navigate('CardDetail', { cardName: card.name })}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1 flex-row items-center gap-3">
                      {isSelecting && (
                        <Ionicons
                          name={isSelected ? "checkbox" : "square-outline"}
                          size={20}
                          color={isSelected ? COLORS.primary[600] : COLORS.text.muted}
                        />
                      )}
                      <Text className="text-[17px] font-bold text-text">
                        {card.name}
                      </Text>
                    </View>
                    {!isSelecting && (
                      <View className="flex-row items-center gap-2">
                        {filter === 'all' && (
                          <View className={`w-7 h-7 rounded-full items-center justify-center ${card.owner === 'Savannah' ? 'bg-primary-600' : 'bg-secondary-600'}`}>
                            <Text className="text-white text-[10px] font-bold">{card.owner.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {!isSelecting && taskTimeFilter !== 'none' && (
                    <>
                      {cardTasks.length > 0 && (
                        <View className="pl-0 mt-2">
                          {cardTasks.slice(0, 3).map((task: Task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              onToggleDone={handleToggleDone}
                              variant="list"
                              hideBackground
                              hideCardName
                              showOwnerIcon={false}
                            />
                          ))}
                          {cardTasks.length > 3 && (
                            <Text className="text-[11px] text-text-muted italic ml-14">
                              + {cardTasks.length - 3} more tasks
                            </Text>
                          )}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>
        <View className="h-20" />
      </ScrollView>

      {/* Floating Selective Shuffle Button */}
      {isSelecting && (
        <View className="absolute bottom-10 left-5 right-5">
          <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-primary-600' : 'bg-border'
              }`}
            onPress={handleSelectiveShuffle}
          >
            <Text className="text-white font-bold text-lg">
              Reassign {selectedCardNames.length} Cards
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Menu BottomSheet */}
      <BottomSheet
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
      >
        <Text className="text-xl font-bold text-text mb-6">Filter Roster</Text>

        <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Ownership</Text>
        <View className="flex-row gap-2 mb-8">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`flex-1 py-3 px-4 rounded-xl border items-center ${filter === 'all' ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'}`}
          >
            <Text className={`font-semibold ${filter === 'all' ? 'text-primary-600' : 'text-text-secondary'}`}>All Hands</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('me')}
            className={`flex-1 py-3 px-4 rounded-xl border items-center ${filter === 'me' ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'}`}
          >
            <Text className={`font-semibold ${filter === 'me' ? 'text-primary-600' : 'text-text-secondary'}`}>Just Me</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Task Visibility</Text>
        <View className="flex-row flex-wrap gap-2 mb-8">
          {(['none', 'week', 'month', 'year', 'all'] as TaskTimeFilter[]).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setTaskTimeFilter(f)}
              className={`py-2.5 px-4 rounded-xl border ${taskTimeFilter === f ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'}`}
            >
              <Text className={`text-sm font-semibold capitalize ${taskTimeFilter === f ? 'text-primary-600' : 'text-text-muted'}`}>
                {f === 'none' ? 'Hidden' : f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-8">
          <Checkbox
            label="Hide completed tasks"
            checked={hideCompleted}
            onPress={() => setHideCompleted(!hideCompleted)}
            className="mb-4"
          />

          <Checkbox
            label="Hide tasks without a due date"
            checked={hideUndated}
            onPress={() => setHideUndated(!hideUndated)}
          />
        </View>

        <Button
          title="Done"
          onPress={() => setShowFilterMenu(false)}
          variant="primary"
          className="mt-4"
        />
      </BottomSheet>

      {/* Shuffle Modal (Options) */}
      <Modal
        visible={showShuffleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowShuffleModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowShuffleModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
            style={{ backgroundColor: COLORS.surface.DEFAULT, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40 }}
          >
            <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />

            <Text className="text-[22px] font-bold text-text mb-2">
              Rebalance Household
            </Text>
            <Text className="text-sm text-text-secondary mb-6 leading-5">
              Periodically reassigning cards ensures a more balanced and fair distribution of domestic labor.
            </Text>

            <TouchableOpacity
              className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center gap-4 shadow-sm"
              onPress={() => startSwipeShuffle()}
            >
              <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center">
                <Ionicons name="refresh" size={20} color={COLORS.primary[600]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text">Reassign Entire Deck</Text>
                <Text className="text-xs text-text-secondary mt-0.5">Swipe through all current cards</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface rounded-xl p-4 mb-3 border border-border flex-row items-center gap-4 shadow-sm"
              onPress={() => {
                setShowShuffleModal(false);
                setIsSelecting(true);
              }}
            >
              <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center">
                <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary[600]} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-text">Selective Reassignment</Text>
                <Text className="text-xs text-text-secondary mt-0.5">Choose specific cards to trade</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-50 rounded-xl p-4 mb-6 border border-red-100 flex-row items-center gap-4 shadow-sm"
              onPress={handleFreshStart}
            >
              <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                <Ionicons name="trash" size={20} color="#dc2626" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-red-600">Fresh Start</Text>
                <Text className="text-xs text-red-500 mt-0.5">Delete all and start with defaults</Text>
              </View>
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Swipe Mode Modal */}
      <Modal
        visible={showSwipeMode}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowSwipeMode(false)}
      >
        <View className="flex-1 bg-surface-dim pt-10 pb-[30px] px-5">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-2xl font-bold text-text">
              Assign Cards
            </Text>
            <TouchableOpacity onPress={() => setShowSwipeMode(false)}>
              <Text className="text-lg font-semibold text-primary-600">Cancel</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mb-5">
            <Text className="text-base font-semibold text-text-secondary">
              {currentCardIndex} / {shuffledCards.length}
            </Text>
          </View>

          <View className="flex-row justify-between mb-5 px-5">
            <View className="flex-row items-center gap-2">
              <Text className="text-2xl font-bold text-primary-600">←</Text>
              <Text className="text-base font-semibold text-text">Savannah Hand</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-text">Kevin Hand</Text>
              <Text className="text-2xl font-bold text-secondary-600">→</Text>
            </View>
          </View>

          <View className="flex-1 justify-center items-center relative">
            {shuffledCards.length > 0 && (
              <Swiper
                ref={swiperRef}
                cards={shuffledCards}
                renderCard={(card) => (
                  <View className="h-[250px] w-full bg-surface rounded-2xl p-5 justify-center items-center shadow-lg border border-border-light">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-text text-center mb-4">
                        {card.name}
                      </Text>
                    </View>
                  </View>
                )}
                onSwipedLeft={handleSwipeLeft}
                onSwipedRight={handleSwipeRight}
                onSwipedAll={() => finishShuffle(shuffledCards)}
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
        </View>
      </Modal>

      {/* Add Card Modal */}
      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
    </View >
  );
};

// ─── Add Card Modal ───────────────────────────────────────────────────────────

interface AddCardModalProps {
  onClose: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ onClose }) => {
  const [cardName, setCardName] = React.useState('');
  const [selectedOwner, setSelectedOwner] = React.useState<'Savannah' | 'Kevin'>('Savannah');

  const handleAddCard = (isQuiet = false) => {
    if (!cardName.trim()) {
      if (!isQuiet) Alert.alert('Missing Information', 'Please enter a card name.');
      onClose();
      return;
    }

    fakeData.cards.push({ name: cardName.trim(), owner: selectedOwner });
    if (!isQuiet) {
      Alert.alert(
        'Card Added!',
        `"${cardName}" has been added to ${selectedOwner}'s cards.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => handleAddCard(true)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => handleAddCard(true)}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={e => e.stopPropagation()}
          style={{ backgroundColor: COLORS.surface.DEFAULT, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 50 }}
        >
          <View className="w-10 h-1.5 bg-border rounded-full self-center mb-6 opacity-30" />

          <Text className="text-xl font-bold text-text mb-6">New Card</Text>

          <TextInput
            className="text-lg font-medium text-text mb-6 py-3.5 px-4 rounded-xl bg-surface-dim border border-border"
            placeholder="Card Name (e.g. Groceries, Rent)"
            value={cardName}
            onChangeText={setCardName}
            autoFocus
          />

          <View className="mb-8">
            <Text className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Owner</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl items-center border ${selectedOwner === 'Savannah' ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'
                  }`}
                onPress={() => setSelectedOwner('Savannah')}
              >
                <Text
                  className={`text-sm font-semibold ${selectedOwner === 'Savannah' ? 'text-primary-600' : 'text-text-secondary'
                    }`}
                >
                  Savannah
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 px-4 rounded-xl items-center border ${selectedOwner === 'Kevin' ? 'bg-primary-50 border-primary-600' : 'bg-surface border-border'
                  }`}
                onPress={() => setSelectedOwner('Kevin')}
              >
                <Text
                  className={`text-sm font-semibold ${selectedOwner === 'Kevin' ? 'text-primary-600' : 'text-text-secondary'
                    }`}
                >
                  Kevin
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-primary-600 py-4 rounded-2xl items-center shadow-sm"
            onPress={() => handleAddCard(false)}
          >
            <Text className="text-white font-bold text-base">Add Card</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
