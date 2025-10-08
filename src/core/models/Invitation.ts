import { InvitationId, HouseholdId, UserId } from '@shared/types/branded';
import { InvitationStatus } from '@shared/types/enums';

/**
 * Invitation domain model
 * Represents an invitation to join a household
 */
export interface Invitation {
  id: InvitationId;
  householdId: HouseholdId;
  invitedBy: UserId;
  invitedEmail: string;
  inviteCode: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create invitation data transfer object
 */
export interface CreateInvitationDTO {
  householdId: HouseholdId;
  invitedEmail: string;
}

/**
 * Accept invitation data transfer object
 */
export interface AcceptInvitationDTO {
  inviteCode: string;
}

