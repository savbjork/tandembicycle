import {
  Household,
  CreateHouseholdDTO,
  UpdateHouseholdDTO,
  HouseholdMember,
} from '@core/models/Household';
import { HouseholdId, UserId } from '@shared/types';
import { AsyncResult } from '@shared/types';

/**
 * Household repository interface
 * Defines operations for household data access
 */
export interface IHouseholdRepository {
  /**
   * Create a new household
   */
  create(createdBy: UserId, data: CreateHouseholdDTO): AsyncResult<Household>;

  /**
   * Get household by ID
   */
  getById(householdId: HouseholdId): AsyncResult<Household>;

  /**
   * Get all households for a user
   */
  getByUserId(userId: UserId): AsyncResult<Household[]>;

  /**
   * Update household
   */
  update(householdId: HouseholdId, data: UpdateHouseholdDTO): AsyncResult<Household>;

  /**
   * Delete household
   */
  delete(householdId: HouseholdId): AsyncResult<void>;

  /**
   * Add member to household
   */
  addMember(householdId: HouseholdId, userId: UserId): AsyncResult<void>;

  /**
   * Remove member from household
   */
  removeMember(householdId: HouseholdId, userId: UserId): AsyncResult<void>;

  /**
   * Get household members with user info
   */
  getMembers(householdId: HouseholdId): AsyncResult<HouseholdMember[]>;
}

