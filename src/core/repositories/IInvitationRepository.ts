import {
  Invitation,
  CreateInvitationDTO,
  AcceptInvitationDTO,
} from '@core/models/Invitation';
import { InvitationId, HouseholdId } from '@shared/types';
import { AsyncResult } from '@shared/types';

/**
 * Invitation repository interface
 * Defines operations for invitation data access
 */
export interface IInvitationRepository {
  /**
   * Create a new invitation
   */
  create(data: CreateInvitationDTO): AsyncResult<Invitation>;

  /**
   * Get invitation by ID
   */
  getById(invitationId: InvitationId): AsyncResult<Invitation>;

  /**
   * Get invitation by invite code
   */
  getByInviteCode(inviteCode: string): AsyncResult<Invitation | null>;

  /**
   * Get all invitations for a household
   */
  getByHouseholdId(householdId: HouseholdId): AsyncResult<Invitation[]>;

  /**
   * Accept invitation
   */
  accept(inviteCode: string): AsyncResult<Invitation>;

  /**
   * Delete invitation
   */
  delete(invitationId: InvitationId): AsyncResult<void>;

  /**
   * Check if invitation is expired
   */
  isExpired(invitation: Invitation): boolean;
}

