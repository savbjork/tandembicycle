import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { type Card, type Task, type Person } from '@shared/data/FakeDataStore';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';

export const DEFAULT_CARDS = [
  // --- Daily/Weekly Cleaning & Chores ---
  'Cook dinner',
  'Cook breakfast/lunch',
  'Dishes',
  'Wipe down counters',
  'Take out trash',
  'Recycling & compost',
  'Mop',
  'Sweep',
  'Vacuum',
  'Laundry',
  'Wash bedding & linens',
  'Water plants',
  'Sort mail & packages',

  // --- Deep Cleaning & Organization ---
  'Bathroom deep clean',
  'Kitchen deep clean',
  'Clean out fridge',
  'Clean microwave/oven',
  'Clean windows & mirrors',
  'Dusting',
  'Organize closets & drawers',
  'Decluttering/Donations',

  // --- Food & Supplies ---
  'Meal planning',
  'Grocery shopping',
  'Buy cleaning supplies',
  'Buy household consumables (TP, soap)',

  // --- Maintenance & Household ---
  'House maintenance',
  'Yard work / Lawn care',
  'Snow removal / Seasonal exterior',
  'Car maintenance',
  'Vehicle registration',
  'Home tech support & wifi',

  // --- Financial & Admin ---
  'Manage budget',
  'Pay credit card bills',
  'Pay utility bills',
  'Manage subscriptions',
  'Taxes',
  'Retirement',
  'Investing',
  'Car insurance',
  'Rental/Homeowners Insurance',
  'Health insurance admin',
  'Internet',

  // --- Relational & Social ---
  'Plan dates',
  'Plan vacations & travel',
  'Family events',
  'Family holiday/birthday gifts',
  'Write thank you notes/cards',
  'Host guests/entertaining',

  // --- Health & Personal Admin ---
  'Schedule medical/dental appointments',
  'Pick up prescriptions',
] as const;

interface UseCardShuffleProps {
  cards: Card[];
  reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
  resetToDefaults: (freshCards: Card[], freshTasks: Task[]) => void;
  removeCard: (name: string) => void;
  onShuffleEnd?: () => void;
}

export const useCardShuffle = ({
  cards,
  reassignCards,
  resetToDefaults,
  removeCard,
  onShuffleEnd,
}: UseCardShuffleProps) => {
  const { currentUser } = useCurrentUser();
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [showSwipeMode, setShowSwipeMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Array<{ name: string; owner?: Person }>>([]);
  const [isDefaultsMode, setIsDefaultsMode] = useState(false);
  const [deletedCardNames, setDeletedCardNames] = useState<string[]>([]);

  const startSwipeShuffle = useCallback(
    (cardsToShuffle: Card[] = cards) => {
      setDeletedCardNames([]);
      setIsDefaultsMode(false);
      setShowShuffleModal(false);
      setShuffledCards([...cardsToShuffle]);
      setCurrentCardIndex(0);
      setShowSwipeMode(true);
    },
    [cards]
  );

  const startWithDefaults = useCallback(() => {
    setDeletedCardNames([]);
    const defaultCardObjects = DEFAULT_CARDS.map((name) => ({ name, owner: currentUser }));
    setIsDefaultsMode(true);
    setShuffledCards(defaultCardObjects);
    setCurrentCardIndex(0);
    setShowSwipeMode(true);
  }, [currentUser]);

  const assignCard = useCallback((cardIndex: number, owner: Person) => {
    setShuffledCards((prev) => {
      const updated = [...prev];
      if (updated[cardIndex]) {
        updated[cardIndex] = { ...updated[cardIndex], owner };
      }
      return updated;
    });
    setCurrentCardIndex(cardIndex + 1);
  }, []);

  const markCardDeleted = useCallback(
    (cardIndex: number) => {
      const cardName = shuffledCards[cardIndex]?.name;
      if (cardName) {
        setDeletedCardNames((prev) => [...prev, cardName]);
      }
      setCurrentCardIndex(cardIndex + 1);
    },
    [shuffledCards]
  );

  const finishShuffle = useCallback(
    (updatedCards: typeof shuffledCards) => {
      const keptCards = updatedCards.filter((c) => !deletedCardNames.includes(c.name));

      if (isDefaultsMode) {
        const freshCards: Card[] = keptCards.map((c) => ({
          name: c.name,
          owner: c.owner,
        }));
        resetToDefaults(freshCards, []);
      } else {
        // Every kept card was swiped and assigned a concrete owner before reaching
        // this point (assignCard always sets one), so owner is never undefined here.
        reassignCards(
          keptCards
            .filter((c): c is { name: string; owner: Person } => c.owner !== undefined)
            .map((c) => ({ name: c.name, owner: c.owner }))
        );
        deletedCardNames.forEach((name) => removeCard(name));
      }

      setDeletedCardNames([]);
      setIsDefaultsMode(false);
      setShowSwipeMode(false);
      setCurrentCardIndex(0);
      if (onShuffleEnd) onShuffleEnd();
    },
    [isDefaultsMode, deletedCardNames, reassignCards, resetToDefaults, removeCard, onShuffleEnd]
  );

  const cancelSwipe = useCallback(() => {
    setDeletedCardNames([]);
    setIsDefaultsMode(false);
    setShowSwipeMode(false);
  }, []);

  const handleFreshStart = useCallback(() => {
    Alert.alert(
      'Fresh Start?',
      'This will delete ALL current cards and reset to a standard deck. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            setShowShuffleModal(false);
            startWithDefaults();
          },
        },
      ]
    );
  }, [startWithDefaults]);

  return {
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
  };
};
