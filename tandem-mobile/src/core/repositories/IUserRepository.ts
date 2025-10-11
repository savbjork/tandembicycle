import { User, CreateUserDTO, UpdateUserDTO } from '@core/models/User';
import { UserId, HouseholdId } from '@shared/types';
import { AsyncResult } from '@shared/types';

/**
 * User repository interface
 * Defines operations for user data access
 */
export interface IUserRepository {
  /**
   * Create a new user
   */
  create(userId: UserId, data: CreateUserDTO): AsyncResult<User>;

  /**
   * Get user by ID
   */
  getById(userId: UserId): AsyncResult<User>;

  /**
   * Get user by email
   */
  getByEmail(email: string): AsyncResult<User | null>;

  /**
   * Update user
   */
  update(userId: UserId, data: UpdateUserDTO): AsyncResult<User>;

  /**
   * Delete user
   */
  delete(userId: UserId): AsyncResult<void>;

  /**
   * Add household to user's household list
   */
  addHousehold(userId: UserId, householdId: HouseholdId): AsyncResult<void>;

  /**
   * Remove household from user's household list
   */
  removeHousehold(userId: UserId, householdId: HouseholdId): AsyncResult<void>;
}

