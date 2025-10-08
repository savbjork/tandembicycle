import { HouseholdId, UserId, CardId } from '@shared/types/branded';

/**
 * Household domain model
 * Represents a household where members collaborate on task distribution
 */
export interface Household {
  id: HouseholdId;
  name: string;
  createdBy: UserId;
  memberIds: UserId[];
  activeCardIds: CardId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Household creation data transfer object
 */
export interface CreateHouseholdDTO {
  name: string;
}

/**
 * Household update data transfer object
 */
export interface UpdateHouseholdDTO {
  name?: string;
  activeCardIds?: CardId[];
}

/**
 * Household member information for UI display
 */
export interface HouseholdMember {
  userId: UserId;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: Date;
}

