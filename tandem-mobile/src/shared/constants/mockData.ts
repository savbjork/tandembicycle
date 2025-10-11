import { User } from '@core/models/User';
import { Household } from '@core/models/Household';
import { HouseholdCard } from '@core/models/HouseholdCard';
import { CardTemplate } from '@core/models/Card';
import { asUserId, asHouseholdId, asCardId, asHouseholdCardId } from '@shared/types';
import { AuthProvider } from '@shared/types';
import { CARD_TEMPLATES } from './cardTemplates';

/**
 * Mock data for front-end development
 * This data simulates what would come from Firebase
 */

// Mock Users
export const MOCK_USER_1: User = {
  id: asUserId('user-1'),
  email: 'sarah@example.com',
  name: 'Sarah Johnson',
  authProvider: AuthProvider.EMAIL,
  currentHouseholdId: asHouseholdId('household-1'),
  householdIds: [asHouseholdId('household-1')],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export const MOCK_USER_2: User = {
  id: asUserId('user-2'),
  email: 'mike@example.com',
  name: 'Mike Johnson',
  authProvider: AuthProvider.EMAIL,
  currentHouseholdId: asHouseholdId('household-1'),
  householdIds: [asHouseholdId('household-1')],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

// Mock Household
export const MOCK_HOUSEHOLD: Household = {
  id: asHouseholdId('household-1'),
  name: 'The Johnson Family',
  createdBy: asUserId('user-1'),
  memberIds: [asUserId('user-1'), asUserId('user-2')],
  activeCardIds: CARD_TEMPLATES.slice(0, 15).map((_, i) => asCardId(`card-${i + 1}`)),
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-10-08'),
};

// Convert card templates to have proper IDs
export const MOCK_CARD_TEMPLATES: CardTemplate[] = CARD_TEMPLATES.map((card, index) => ({
  ...card,
  id: asCardId(`card-${index + 1}`),
}));

// Mock Household Cards (cards assigned to household members)
export const MOCK_HOUSEHOLD_CARDS: HouseholdCard[] = [
  // Sarah's cards (user-1)
  {
    id: asHouseholdCardId('hc-1'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-1'), // Daily Tidying
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: asHouseholdCardId('hc-2'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-2'), // Laundry
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: asHouseholdCardId('hc-11'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-11'), // Meal Planning
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: asHouseholdCardId('hc-12'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-12'), // Grocery Shopping
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-20'),
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: asHouseholdCardId('hc-19'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-19'), // Morning Routine
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-02-01'),
      },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: asHouseholdCardId('hc-21'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-21'), // School Communication
    currentOwner: asUserId('user-1'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-1'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-02-01'),
      },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },

  // Mike's cards (user-2)
  {
    id: asHouseholdCardId('hc-3'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-3'), // Dishes & Kitchen Cleanup
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: asHouseholdCardId('hc-4'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-4'), // Deep Cleaning
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: asHouseholdCardId('hc-5'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-5'), // Trash & Recycling
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-15'),
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: asHouseholdCardId('hc-7'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-7'), // Yard Work
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-18'),
      },
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: asHouseholdCardId('hc-10'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-10'), // Car Care
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-01-18'),
      },
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: asHouseholdCardId('hc-15'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-15'), // Dinner
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-2'),
        assignedAt: new Date('2024-01-22'),
      },
    ],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: asHouseholdCardId('hc-20'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-20'), // Bedtime Routine
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-1'),
        assignedAt: new Date('2024-02-01'),
        note: 'You do bedtime, I do mornings!',
      },
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: asHouseholdCardId('hc-23'),
    householdId: asHouseholdId('household-1'),
    cardId: asCardId('card-23'), // Kid Activities & Sports
    currentOwner: asUserId('user-2'),
    isActive: true,
    assignmentHistory: [
      {
        assignedTo: asUserId('user-2'),
        assignedBy: asUserId('user-2'),
        assignedAt: new Date('2024-02-05'),
      },
    ],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
];

// Helper functions to get mock data
export const getMockCurrentUser = (): User => MOCK_USER_1;

export const getMockHousehold = (): Household => MOCK_HOUSEHOLD;

export const getMockHouseholdMembers = (): User[] => [MOCK_USER_1, MOCK_USER_2];

export const getMockUserCards = (userId: string): HouseholdCard[] => {
  return MOCK_HOUSEHOLD_CARDS.filter((card) => card.currentOwner === userId);
};

export const getMockCardTemplate = (cardId: string): CardTemplate | undefined => {
  return MOCK_CARD_TEMPLATES.find((card) => card.id === cardId);
};

export const getMockCardBalance = (): { user1Count: number; user2Count: number } => {
  const user1Cards = MOCK_HOUSEHOLD_CARDS.filter(
    (card) => card.currentOwner === MOCK_USER_1.id
  );
  const user2Cards = MOCK_HOUSEHOLD_CARDS.filter(
    (card) => card.currentOwner === MOCK_USER_2.id
  );
  return {
    user1Count: user1Cards.length,
    user2Count: user2Cards.length,
  };
};

