import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { type Card, type Task, type Person, type CardFrequency } from '@shared/data/FakeDataStore';
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
    'Pick up prescriptions'
] as const;

export const DEFAULT_CARD_FREQUENCIES: Partial<Record<typeof DEFAULT_CARDS[number], CardFrequency>> = {
    // Daily
    'Cook dinner': 'daily',
    'Cook breakfast/lunch': 'daily',
    'Dishes': 'daily',
    'Wipe down counters': 'daily',
    'Water plants': 'daily',
    'Sort mail & packages': 'daily',

    // Weekly
    'Take out trash': 'weekly',
    'Recycling & compost': 'weekly',
    'Mop': 'weekly',
    'Sweep': 'weekly',
    'Vacuum': 'weekly',
    'Laundry': 'weekly',
    'Wash bedding & linens': 'weekly',
    'Meal planning': 'weekly',
    'Grocery shopping': 'weekly',
    'Buy cleaning supplies': 'weekly',
    'Buy household consumables (TP, soap)': 'weekly',
    'Yard work / Lawn care': 'weekly',
    'Pay credit card bills': 'weekly',
    'Pay utility bills': 'weekly',

    // As-needed (everything else defaults here, but explicit for clarity)
    'Bathroom deep clean': 'as-needed',
    'Kitchen deep clean': 'as-needed',
    'Clean out fridge': 'as-needed',
    'Clean microwave/oven': 'as-needed',
    'Clean windows & mirrors': 'as-needed',
    'Dusting': 'as-needed',
    'Organize closets & drawers': 'as-needed',
    'Decluttering/Donations': 'as-needed',
    'House maintenance': 'as-needed',
    'Snow removal / Seasonal exterior': 'as-needed',
    'Car maintenance': 'as-needed',
    'Vehicle registration': 'as-needed',
    'Home tech support & wifi': 'as-needed',
    'Manage budget': 'as-needed',
    'Manage subscriptions': 'as-needed',
    'Taxes': 'as-needed',
    'Retirement': 'as-needed',
    'Investing': 'as-needed',
    'Car insurance': 'as-needed',
    'Rental/Homeowners Insurance': 'as-needed',
    'Health insurance admin': 'as-needed',
    'Internet': 'as-needed',
    'Plan dates': 'as-needed',
    'Plan vacations & travel': 'as-needed',
    'Family events': 'as-needed',
    'Family holiday/birthday gifts': 'as-needed',
    'Write thank you notes/cards': 'as-needed',
    'Host guests/entertaining': 'as-needed',
    'Schedule medical/dental appointments': 'as-needed',
    'Pick up prescriptions': 'as-needed',
};

interface UseCardShuffleProps {
    cards: Card[];
    reassignCards: (assignments: Array<{ name: string; owner: Person }>) => void;
    resetToDefaults: (freshCards: Card[], freshTasks: Task[]) => void;
    archiveCard: (name: string) => void;
    onShuffleEnd?: () => void;
}

export const useCardShuffle = ({
    cards,
    reassignCards,
    resetToDefaults,
    archiveCard,
    onShuffleEnd,
}: UseCardShuffleProps) => {
    const { currentUser } = useCurrentUser();
    const [showShuffleModal, setShowShuffleModal] = useState(false);
    const [showSwipeMode, setShowSwipeMode] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [shuffledCards, setShuffledCards] = useState<Array<{ name: string, owner: Person }>>([]);
    const [isDefaultsMode, setIsDefaultsMode] = useState(false);
    const [archivedCardNames, setArchivedCardNames] = useState<string[]>([]);

    const startSwipeShuffle = useCallback((cardsToShuffle: Card[] = cards) => {
        setArchivedCardNames([]);
        setIsDefaultsMode(false);
        setShowShuffleModal(false);
        setShuffledCards([...cardsToShuffle]);
        setCurrentCardIndex(0);
        setShowSwipeMode(true);
    }, [cards]);

    const startWithDefaults = useCallback(() => {
        setArchivedCardNames([]);
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

    const markCardArchived = useCallback((cardIndex: number) => {
        const cardName = shuffledCards[cardIndex]?.name;
        if (cardName) {
            setArchivedCardNames(prev => [...prev, cardName]);
        }
        setCurrentCardIndex(cardIndex + 1);
    }, [shuffledCards]);

    const finishShuffle = useCallback((updatedCards: typeof shuffledCards) => {
        const nonArchivedCards = updatedCards.filter(c => !archivedCardNames.includes(c.name));

        if (isDefaultsMode) {
            const freshCards: Card[] = nonArchivedCards.map(c => ({
                name: c.name,
                owner: c.owner,
                frequency: DEFAULT_CARD_FREQUENCIES[c.name as typeof DEFAULT_CARDS[number]] ?? 'as-needed',
            }));
            resetToDefaults(freshCards, []);
        } else {
            reassignCards(nonArchivedCards.map(c => ({ name: c.name, owner: c.owner })));
            archivedCardNames.forEach(name => archiveCard(name));
        }

        setArchivedCardNames([]);
        setIsDefaultsMode(false);
        setShowSwipeMode(false);
        setCurrentCardIndex(0);
        if (onShuffleEnd) onShuffleEnd();
    }, [isDefaultsMode, archivedCardNames, reassignCards, resetToDefaults, archiveCard, onShuffleEnd]);

    const cancelSwipe = useCallback(() => {
        setArchivedCardNames([]);
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
        markCardArchived,
        finishShuffle,
        handleFreshStart,
    };
};

