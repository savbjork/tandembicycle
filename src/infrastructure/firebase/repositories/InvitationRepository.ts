import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { IInvitationRepository } from '@core/repositories/IInvitationRepository';
import {
  Invitation,
  CreateInvitationDTO,
} from '@core/models/Invitation';
import {
  InvitationId,
  HouseholdId,
  AsyncResult,
  ErrorCode,
  asInvitationId,
} from '@shared/types';
import { InvitationStatus } from '@shared/types';
import { getFirebaseFirestore } from '../config';
import { Collections } from '../collections';
import { invitationConverter } from '../converters';

/**
 * Generate a random invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export class InvitationRepository implements IInvitationRepository {
  private get invitationsCollection() {
    return collection(getFirebaseFirestore(), Collections.INVITATIONS).withConverter(
      invitationConverter
    );
  }

  async create(data: CreateInvitationDTO): AsyncResult<Invitation> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const inviteCode = generateInviteCode();

      const invitationRef = doc(this.invitationsCollection);
      const invitation: Invitation = {
        id: asInvitationId(invitationRef.id),
        householdId: data.householdId,
        invitedBy: data.invitedBy,
        invitedEmail: data.invitedEmail,
        inviteCode,
        status: InvitationStatus.PENDING,
        expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(invitationRef, invitation);

      return { success: true, data: invitation };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to create invitation',
          details: error,
        },
      };
    }
  }

  async getById(invitationId: InvitationId): AsyncResult<Invitation> {
    try {
      const invitationRef = doc(this.invitationsCollection, invitationId);
      const invitationDoc = await getDoc(invitationRef);

      if (!invitationDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Invitation not found',
          },
        };
      }

      return { success: true, data: invitationDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch invitation',
          details: error,
        },
      };
    }
  }

  async getByInviteCode(inviteCode: string): AsyncResult<Invitation | null> {
    try {
      const q = query(
        this.invitationsCollection,
        where('inviteCode', '==', inviteCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: true, data: null };
      }

      return { success: true, data: querySnapshot.docs[0].data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch invitation by code',
          details: error,
        },
      };
    }
  }

  async getByHouseholdId(householdId: HouseholdId): AsyncResult<Invitation[]> {
    try {
      const q = query(
        this.invitationsCollection,
        where('householdId', '==', householdId)
      );
      const querySnapshot = await getDocs(q);
      const invitations = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: invitations };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch invitations for household',
          details: error,
        },
      };
    }
  }

  async accept(inviteCode: string): AsyncResult<Invitation> {
    try {
      const invitationResult = await this.getByInviteCode(inviteCode);
      if (!invitationResult.success || !invitationResult.data) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Invitation not found',
          },
        };
      }

      const invitation = invitationResult.data;

      if (this.isExpired(invitation)) {
        return {
          success: false,
          error: {
            code: ErrorCode.VALIDATION,
            message: 'Invitation has expired',
          },
        };
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        return {
          success: false,
          error: {
            code: ErrorCode.VALIDATION,
            message: 'Invitation is not pending',
          },
        };
      }

      const invitationRef = doc(this.invitationsCollection, invitation.id);
      await updateDoc(invitationRef, {
        status: InvitationStatus.ACCEPTED,
        updatedAt: new Date(),
      });

      const updatedDoc = await getDoc(invitationRef);
      return { success: true, data: updatedDoc.data()! };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to accept invitation',
          details: error,
        },
      };
    }
  }

  async delete(invitationId: InvitationId): AsyncResult<void> {
    try {
      const invitationRef = doc(this.invitationsCollection, invitationId);
      await deleteDoc(invitationRef);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to delete invitation',
          details: error,
        },
      };
    }
  }

  isExpired(invitation: Invitation): boolean {
    return new Date() > invitation.expiresAt;
  }
}

