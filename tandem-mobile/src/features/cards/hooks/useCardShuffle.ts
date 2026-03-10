import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { type Card, type Task, type Person } from '@shared/data/FakeDataStore';
import { useCurrentUser } from '@shared/hooks/useCurrentUser';

export const DEFAULT_CARDS = [
    'House maintenance',
    'Car maintenance',
    'Bathroom deep clean',
    'Mop',
    'Vacuum',
    'Cook dinner',
    'Laundry',
    'Take out trash',
    'Family events',
    'Family holiday/birthday gifts',
    'Grocery shopping',
    'Cleaning supplies',
    'Plan dates',
    'Car insurance',
    'Rental Insurance',
    'Internet',
    'Dishes',
    'Kitchen deep clean',
    'Pay credit card bills',
    'Manage budget',
    'Retirement',
    'Investing',
    'Taxes',
    'Clean out fridge',
] as const;

interface UseCardShuffleProps {
    cards: Card[];
    reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
    resetToDefaults: (freshCards: Card[], freshTasks: Task[]) => void;
    onShuffleEnd?: () => void;
}

export const useCardShuffle = ({
    cards,
    reassignCards,
    resetToDefaults,
    onShuffleEnd,
}: UseCardShuffleProps) => {
    const { currentUser } = useCurrentUser();
    const [showShuffleModal, setShowShuffleModal] = useState(false);
    const [showSwipeMode, setShowSwipeMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [shuffledCards, setShuffledCards] = useState<Array<{ name: string, owner: Person }>>([]);
    const [isDefaultsMode, setIsDefaultsMode] = useState(false);

    const startSwipeShuffle = useCallback((cardsToShuffle: Card[] = cards) => {
        setIsDefaultsMode(false);
        setShowShuffleModal(false);
        setShuffledCards([...cardsToShuffle]);
        setCurrentCardIndex(0);
        setShowSwipeMode(true);
    }, [cards]);

    const startWithDefaults = useCallback(() => {
        const defaultCardObjects = DEFAULT_CARDS.map(name => ({ name, owner: currentUser }));
        setIsDefaultsMode(true);
        setShuffledCards(defaultCardObjects);
        setCurrentCardIndex(0);
        setShowSwipeMode(true);
    }, [currentUser]);

    const assignCard = useCallback((cardIndex: number, owner: Person) => {
        setShuffledCards(prev => {
            const updated = [...prev];
            if (updated[cardIndex]) {
                updated[cardIndex] = { ...updated[cardIndex], owner };
            }
            return updated;
        });
        setCurrentCardIndex(cardIndex + 1);
    }, []);

    const finishShuffle = useCallback((updatedCards: typeof shuffledCards) => {
        if (isDefaultsMode) {
            const freshCards: Card[] = updatedCards.map(c => ({ name: c.name, owner: c.owner }));
            resetToDefaults(freshCards, []);
        } else {
            reassignCards(updatedCards.map(c => ({ name: c.name, owner: c.owner })));
        }
        setIsDefaultsMode(false);
        setShowSwipeMode(false);
        setCurrentCardIndex(0);
        if (onShuffleEnd) onShuffleEnd();
    }, [isDefaultsMode, reassignCards, resetToDefaults, onShuffleEnd]);

    const cancelSwipe = useCallback(() => {
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
            ],
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
        finishShuffle,
        handleFreshStart,
    };
};

