import { HouseholdCardId, HouseholdId, CardId, UserId } from '@shared/types/branded';

/**
 * Assignment record for tracking ownership history
 */
export interface Assignment {
  assignedTo: UserId | null;
  assignedBy: UserId;
  assignedAt: Date;
  note?: string;
}

/**
 * HouseholdCard domain model
 * Represents an instance of a card template in a specific household
 * Tracks ownership and assignment history
 */
export interface HouseholdCard {
  id: HouseholdCardId;
  householdId: HouseholdId;
  cardId: CardId;
  currentOwner: UserId | null;
  isActive: boolean;
  assignmentHistory: Assignment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create household card data transfer object
 */
export interface CreateHouseholdCardDTO {
  householdId: HouseholdId;
  cardId: CardId;
  currentOwner?: UserId;
}

/**
 * Update household card data transfer object
 */
export interface UpdateHouseholdCardDTO {
  currentOwner?: UserId | null;
  isActive?: boolean;
  notes?: string;
}

/**
 * Assign card to a household member
 */
export interface AssignCardDTO {
  assignedTo: UserId | null;
  assignedBy: UserId;
  note?: string;
}

