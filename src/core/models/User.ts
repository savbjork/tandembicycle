import { UserId, HouseholdId } from '@shared/types/branded';
import { AuthProvider } from '@shared/types/enums';

/**
 * User domain model
 * Represents a user in the Fair Play system
 */
export interface User {
  id: UserId;
  email: string;
  name: string;
  avatar?: string;
  authProvider: AuthProvider;
  currentHouseholdId?: HouseholdId;
  householdIds: HouseholdId[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation data transfer object
 */
export interface CreateUserDTO {
  email: string;
  name: string;
  authProvider: AuthProvider;
  avatar?: string;
}

/**
 * User update data transfer object
 */
export interface UpdateUserDTO {
  name?: string;
  avatar?: string;
  currentHouseholdId?: HouseholdId;
}

