import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, ScreenHeader } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { DoneButton } from '@shared/components/ui/HeaderButtons';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { type TaskTimeFilter } from '@shared/utils/date';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '@app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Decomposed Components
import { BalanceMeter } from '../components/BalanceMeter';
import { CardListItem } from '../components/CardListItem';
import { NavigationRow } from '../components/NavigationRow';
import { CardFilterSheet } from '../components/CardFilterSheet';
import { ShuffleModal } from '../components/ShuffleModal';
import { SwipeModeScreen } from '../components/SwipeModeScreen';
import { AddCardModal } from '../components/AddCardModal';

// Custom Hooks
import { useCardsFiltering, type CardsFilter } from '../hooks/useCardsFiltering';
import { useCardShuffle } from '../hooks/useCardShuffle';

interface CardsScreenProps {
  onClose?: () => void;
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export const CardsScreen: React.FC<CardsScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, partner, householdMembers } = useCurrentUser();
  const { cards, tasks, toggleTaskDone, reassignCards, resetToDefaults, archiveCard } = useDataStore();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCardNames, setSelectedCardNames] = useState<string[]>([]);

  // Filter states
  const [filter, setFilter] = useState<CardsFilter>('all');
  const [taskTimeFilter, setTaskTimeFilter] = useState<TaskTimeFilter>('thisWeek');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hideUndated, setHideUndated] = useState(false);
  const [hideEmptyCards, setHideEmptyCards] = useState(false);

  const { filteredCards, getCardTasks } = useCardsFiltering({
    cards,
    tasks,
    filter,
    taskTimeFilter,
    hideEmptyCards,
    hideCompleted,
    hideUndated,
    currentUser,
  });

  const onShuffleEnd = useCallback(() => {
    setIsSelecting(false);
    setSelectedCardNames([]);
  }, []);

  const {
    showShuffleModal,
    setShowShuffleModal,
    showSwipeMode,
    currentCardIndex,
    shuffledCards,
    startSwipeShuffle,
    startWithDefaults,
    cancelSwipe,
    assignCard,
    markCardArchived,
    finishShuffle,
    handleFreshStart,
  } = useCardShuffle({
    cards,
    reassignCards,
    resetToDefaults,
    archiveCard,
    onShuffleEnd,
  });

  const toggleCardSelection = (name: string) => {
    setSelectedCardNames(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSelectiveShuffle = () => {
    const cardsToShuffle = cards.filter(c => selectedCardNames.includes(c.name));
    startSwipeShuffle(cardsToShuffle);
  };

  const handleToggleDone = (taskId: string) => {
    toggleTaskDone(taskId);
  };

  return (
    <View className="flex-1 bg-surface-dim">
      <ScreenHeader
        title={isSelecting ? 'Select Cards' : 'Cards'}
        rightAction={
          isSelecting ? (
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
                  className="bg-surface w-11 h-11 rounded-full items-center justify-center border border-border"
                >
                  <Ionicons name="shuffle" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowFilterMenu(true)}
                className="bg-surface w-11 h-11 rounded-full items-center justify-center border border-border"
              >
                <Ionicons name="options-outline" size={24} color={COLORS.text.secondary} />
                {(filter !== 'all' || taskTimeFilter !== 'hidden' || hideEmptyCards || hideCompleted || hideUndated) && (
                  <View className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-surface" />
                )}
              </TouchableOpacity>
              <AddButton onPress={() => setShowAddCard(true)} />
              {onClose && <DoneButton onPress={onClose} />}
            </View>
          )
        }
      />

      <ScrollView className="flex-1 px-5 pb-5">
        {!isSelecting && (
          <NavigationRow
            onNavigateTasks={() => navigation.navigate('Tasks')}
            onNavigateInbox={() => navigation.navigate('Inbox')}
            onNavigateHome={() => navigation.navigate('Profile')}
          />
        )}

        {!isSelecting && filter === 'all' && (
          <BalanceMeter
            cards={cards}
            currentUser={currentUser}
            partner={partner}
          />
        )}

        <View className="mb-6">
          {cards.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
              <TouchableOpacity
                className="bg-primary-600 px-8 py-4 rounded-2xl shadow-md active:opacity-90"
                onPress={startWithDefaults}
              >
                <Text className="text-white text-lg font-bold">Start with defaults</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredCards.map((card, i) => (
              <CardListItem
                key={`${card.name}-${i}`}
                card={card}
                tasks={getCardTasks(card.name)}
                isSelecting={isSelecting}
                isSelected={selectedCardNames.includes(card.name)}
                onPress={() => navigation.navigate('CardDetail', { cardName: card.name })}
                onToggleSelection={() => toggleCardSelection(card.name)}
                showOwnerBadge={filter === 'all'}
                showTasks={taskTimeFilter !== 'hidden'}
                onToggleTaskDone={(taskId) => handleToggleDone(taskId)}
              />
            ))
          )}
        </View>
        <View className="h-20" />
      </ScrollView>

      {/* Floating Selective Shuffle Button */}
      {isSelecting && (
        <View className="absolute bottom-10 left-5 right-5">
          <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-primary-600' : 'bg-border'
              }`}
            disabled={selectedCardNames.length === 0}
            onPress={handleSelectiveShuffle}
          >
            <Text className="text-white font-bold text-lg">
              Reassign {selectedCardNames.length} Cards
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals & Bottom Sheets */}
      <CardFilterSheet
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
        filter={filter}
        onFilterChange={setFilter}
        taskTimeFilter={taskTimeFilter}
        onTaskTimeFilterChange={setTaskTimeFilter}
        hideCompleted={hideCompleted}
        onHideCompletedChange={setHideCompleted}
        hideUndated={hideUndated}
        onHideUndatedChange={setHideUndated}
        hideEmptyCards={hideEmptyCards}
        onHideEmptyCardsChange={setHideEmptyCards}
      />

      <ShuffleModal
        visible={showShuffleModal}
        onClose={() => setShowShuffleModal(false)}
        onStartSwipeShuffle={() => startSwipeShuffle()}
        onStartSelectiveShuffle={() => {
          setShowShuffleModal(false);
          setIsSelecting(true);
        }}
        onFreshStart={handleFreshStart}
      />

      <SwipeModeScreen
        visible={showSwipeMode}
        onClose={cancelSwipe}
        shuffledCards={shuffledCards}
        currentCardIndex={currentCardIndex}
        members={householdMembers}
        onAssign={assignCard}
        onArchive={markCardArchived}
        onSwipedAll={finishShuffle}
      />

      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
    </View >
  );
};

