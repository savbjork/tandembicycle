import {
  HouseholdCard,
  CreateHouseholdCardDTO,
  UpdateHouseholdCardDTO,
  AssignCardDTO,
} from '@core/models/HouseholdCard';
import { HouseholdCardId, HouseholdId, UserId, CardId } from '@shared/types';
import { AsyncResult } from '@shared/types';

/**
 * Household card repository interface
 * Defines operations for household card instance data access
 */
export interface IHouseholdCardRepository {
  /**
   * Create a new household card instance
   */
  create(data: CreateHouseholdCardDTO): AsyncResult<HouseholdCard>;

  /**
   * Get household card by ID
   */
  getById(householdCardId: HouseholdCardId): AsyncResult<HouseholdCard>;

  /**
   * Get all household cards for a household
   */
  getByHouseholdId(householdId: HouseholdId): AsyncResult<HouseholdCard[]>;

  /**
   * Get household cards assigned to a user
   */
  getByOwner(householdId: HouseholdId, userId: UserId): AsyncResult<HouseholdCard[]>;

  /**
   * Update household card
   */
  update(
    householdCardId: HouseholdCardId,
    data: UpdateHouseholdCardDTO
  ): AsyncResult<HouseholdCard>;

  /**
   * Assign card to a household member
   */
  assignCard(
    householdCardId: HouseholdCardId,
    assignment: AssignCardDTO
  ): AsyncResult<HouseholdCard>;

  /**
   * Delete household card
   */
  delete(householdCardId: HouseholdCardId): AsyncResult<void>;

  /**
   * Check if a card template is already added to household
   */
  existsByCardId(householdId: HouseholdId, cardId: CardId): AsyncResult<boolean>;
}

