/**
 * Firestore collection names
 * Centralized to avoid typos and make refactoring easier
 */

export const Collections = {
  USERS: 'users',
  HOUSEHOLDS: 'households',
  CARD_TEMPLATES: 'card_templates',
  HOUSEHOLD_CARDS: 'household_cards',
  INVITATIONS: 'invitations',
} as const;

export type CollectionName = (typeof Collections)[keyof typeof Collections];

