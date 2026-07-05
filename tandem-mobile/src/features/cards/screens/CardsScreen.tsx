import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Text, ScreenHeader, TextInput } from '@shared/components/ui';
import { AddButton } from '@shared/components/ui/AddButton';
import { DoneButton } from '@shared/components/ui/HeaderButtons';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@shared/constants/colors';
import { useDataStore } from '@store';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainStackParamList, MainTabParamList } from '@app/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Decomposed Components
import { CardListItem } from '../components/CardListItem';
import { NavigationRow } from '../components/NavigationRow';
import { CardFilterSheet } from '../components/CardFilterSheet';
import { ShuffleModal } from '../components/ShuffleModal';
import { SwipeModeScreen } from '../components/SwipeModeScreen';
import { AddCardModal } from '../components/AddCardModal';

// Custom Hooks
import { useCardsFiltering } from '../hooks/useCardsFiltering';
import { useCardShuffle } from '../hooks/useCardShuffle';
import { useCardsFilterPreferences } from '../hooks/useCardsFilterPreferences';

interface CardsScreenProps {
  onClose?: () => void;
}

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MainStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export const CardsScreen: React.FC<CardsScreenProps> = ({ onClose }) => {
  const navigation = useNavigation<NavigationProp>();
  const { currentUser, householdMembers } = useCurrentUser();
  const { cards, tasks, toggleTaskDone, reassignCards, resetToDefaults, removeCard } =
    useDataStore();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedCardNames, setSelectedCardNames] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const flatListRef = useRef<FlatList>(null);
  // mt-1 (4px) + input row (~36px) + mb-4 (16px) = ~56px — used for initial contentOffset
  const SEARCH_BAR_HEIGHT = 56;

  // Filter states (persisted to AsyncStorage)
  const { prefs, update: updateFilter } = useCardsFilterPreferences();
  const { filter, taskTimeFilter, hideCompleted, hideUndated, hideEmptyCards } = prefs;

  const { filteredCards, getCardTasks } = useCardsFiltering({
    cards,
    tasks,
    filter,
    taskTimeFilter,
    hideEmptyCards,
    hideCompleted,
    hideUndated,
    currentUser,
    searchQuery,
  });

  const onShuffleEnd = useCallback(() => {
    setIsSelecting(false);
    setSelectedCardNames([]);
    setSearchQuery('');
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
    markCardDeleted,
    finishShuffle,
    handleFreshStart,
  } = useCardShuffle({
    cards,
    reassignCards,
    resetToDefaults,
    removeCard,
    onShuffleEnd,
  });

  const toggleCardSelection = (name: string) => {
    setSelectedCardNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSelectiveShuffle = () => {
    const cardsToShuffle = cards.filter((c) => selectedCardNames.includes(c.name));
    startSwipeShuffle(cardsToShuffle);
  };

  const handleAssignAllToMe = () => {
    const assignments = selectedCardNames.map((name) => ({ name, owner: currentUser }));
    reassignCards(assignments);
    setIsSelecting(false);
    setSelectedCardNames([]);
    setSearchQuery('');
  };

  const handleToggleDone = (taskId: string) => {
    toggleTaskDone(taskId);
  };

  const listHeader = useMemo(
    () =>
      !isSelecting ? (
        <View>
          <View
            className="mb-4 mt-1"
            onLayout={(e) =>
              flatListRef.current?.scrollToOffset({
                offset: e.nativeEvent.layout.height,
                animated: false,
              })
            }
          >
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-3 py-2 gap-2">
              <Ionicons name="search" size={18} color={COLORS.text.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                // placeholder="Search cards..."
                // placeholderTextColor={COLORS.text.muted}
                className="flex-1 text-base text-text"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <NavigationRow
            onNavigateTasks={() => navigation.navigate('Tasks')}
            onNavigateInbox={() => navigation.navigate('Inbox')}
            onNavigateHome={() => navigation.navigate('Profile')}
          />
        </View>
      ) : null,
    [isSelecting, searchQuery]
  );

  const listFooter = useMemo(
    () => <View className="h-20" />,
    []
  );

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
                setSearchQuery('');
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
                {(filter !== 'all' ||
                  taskTimeFilter !== 'hidden' ||
                  hideEmptyCards ||
                  hideCompleted ||
                  hideUndated) && (
                  <View className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-primary-600 border-2 border-surface" />
                )}
              </TouchableOpacity>
              <AddButton onPress={() => setShowAddCard(true)} />
              {onClose && <DoneButton onPress={onClose} />}
            </View>
          )
        }
      />

      <FlatList
        ref={flatListRef}
        className="flex-1 px-5"
        contentOffset={{ x: 0, y: SEARCH_BAR_HEIGHT }}
        data={filteredCards}
        keyExtractor={(card, i) => `${card.name}-${i}`}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          cards.length === 0 ? (
            <View className="flex-1 items-center justify-center pt-20">
              <TouchableOpacity
                className="bg-surface border border-border px-8 py-4 rounded-2xl active:opacity-70"
                onPress={startWithDefaults}
              >
                <Text className="text-text-secondary text-lg font-semibold">
                  Start with defaults
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center justify-center pt-20">
              <Text className="text-text-muted text-base">No cards match your search</Text>
            </View>
          )
        }
        renderItem={({ item: card }) => (
          <CardListItem
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
        )}
        contentContainerStyle={{ paddingBottom: isSelecting ? 160 : 0 }}
      />

      {/* Floating Selective Shuffle Buttons */}
      {isSelecting && (
        <View className="absolute bottom-10 left-5 right-5 gap-3">
          <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-primary-600' : 'bg-border'}`}
            disabled={selectedCardNames.length === 0}
            onPress={handleAssignAllToMe}
          >
            <Text className="text-white font-bold text-lg">
              Assign all to me ({selectedCardNames.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-4 rounded-xl items-center shadow-lg ${selectedCardNames.length > 0 ? 'bg-secondary-600' : 'bg-border'}`}
            disabled={selectedCardNames.length === 0}
            onPress={handleSelectiveShuffle}
          >
            <Text className="text-white font-bold text-lg">
              Assign one by one ({selectedCardNames.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals & Bottom Sheets */}
      <CardFilterSheet
        visible={showFilterMenu}
        onClose={() => setShowFilterMenu(false)}
        filter={filter}
        onFilterChange={(v) => updateFilter({ filter: v })}
        taskTimeFilter={taskTimeFilter}
        onTaskTimeFilterChange={(v) => updateFilter({ taskTimeFilter: v })}
        hideCompleted={hideCompleted}
        onHideCompletedChange={(v) => updateFilter({ hideCompleted: v })}
        hideUndated={hideUndated}
        onHideUndatedChange={(v) => updateFilter({ hideUndated: v })}
        hideEmptyCards={hideEmptyCards}
        onHideEmptyCardsChange={(v) => updateFilter({ hideEmptyCards: v })}
      />

      <ShuffleModal
        visible={showShuffleModal}
        onClose={() => setShowShuffleModal(false)}
        onStartSwipeShuffle={() => startSwipeShuffle()}
        onStartSelectiveShuffle={() => {
          setShowShuffleModal(false);
          setSearchQuery('');
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
        onDelete={markCardDeleted}
        onSwipedAll={finishShuffle}
      />

      {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
    </View>
  );
};
