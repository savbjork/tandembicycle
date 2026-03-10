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
    const { currentUser, partner } = useCurrentUser();
    const [showShuffleModal, setShowShuffleModal] = useState(false);
    const [showSwipeMode, setShowSwipeMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [shuffledCards, setShuffledCards] = useState<Array<{ name: string, owner: Person }>>([]);
    const [isDefaultsMode, setIsDefaultsMode] = useState(false);

    const startSwipeShuffle = useCallback((cardsToShuffle: Card[] = cards) => {
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
        reassignCards(updatedCards.map(c => ({ name: c.name, owner: c.owner })));
        setShowSwipeMode(false);
        setCurrentCardIndex(0);
        if (onShuffleEnd) onShuffleEnd();
    }, [reassignCards, onShuffleEnd]);

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
                        const freshCards: Card[] = [
                            { name: 'Daily Tidying', owner: currentUser },
                            { name: 'Laundry', owner: currentUser },
                            { name: 'Meal Planning', owner: currentUser },
                            { name: 'Dishes', owner: partner },
                            { name: 'Yard Work', owner: partner },
                            { name: 'Dinner', owner: partner },
                            { name: 'Bedtime Routine', owner: partner },
                        ];
                        const freshTasks: Task[] = [
                            { id: 't1', name: 'Wipe counters', card: 'Daily Tidying', owner: currentUser, dueDate: '2026-02-23', isDone: false },
                            { id: 't4', name: 'Wash clothes', card: 'Laundry', owner: currentUser, dueDate: '2026-02-23', isDone: true },
                        ];
                        resetToDefaults(freshCards, freshTasks);
                        setShowShuffleModal(false);
                        Alert.alert('Reset Complete', 'Standard deck restored.');
                    }
                }
            ]
        );
    }, [currentUser, partner, resetToDefaults]);

    return {
        showShuffleModal,
        setShowShuffleModal,
        showSwipeMode,
        setShowSwipeMode,
        currentCardIndex,
        shuffledCards,
        startSwipeShuffle,
        startWithDefaults,
        assignCard,
        finishShuffle,
        handleFreshStart,
    };
};

