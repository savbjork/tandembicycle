import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from 'firebase/firestore';
import { User } from '@core/models/User';
import { Household } from '@core/models/Household';
import { CardTemplate } from '@core/models/Card';
import { HouseholdCard } from '@core/models/HouseholdCard';
import { Invitation } from '@core/models/Invitation';
import {
  asUserId,
  asHouseholdId,
  asCardId,
  asHouseholdCardId,
  asInvitationId,
} from '@shared/types/branded';

/**
 * Helper to convert Firestore Timestamp to Date
 */
const timestampToDate = (timestamp: Timestamp | undefined): Date => {
  return timestamp ? timestamp.toDate() : new Date();
};

/**
 * Firestore converter for User model
 */
export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User): DocumentData => ({
    email: user.email,
    name: user.name,
    avatar: user.avatar || null,
    authProvider: user.authProvider,
    currentHouseholdId: user.currentHouseholdId || null,
    householdIds: user.householdIds,
    createdAt: Timestamp.fromDate(user.createdAt),
    updatedAt: Timestamp.fromDate(user.updatedAt),
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): User => {
    const data = snapshot.data(options);
    return {
      id: asUserId(snapshot.id),
      email: data.email,
      name: data.name,
      avatar: data.avatar || undefined,
      authProvider: data.authProvider,
      currentHouseholdId: data.currentHouseholdId
        ? asHouseholdId(data.currentHouseholdId)
        : undefined,
      householdIds: (data.householdIds || []).map((id: string) => asHouseholdId(id)),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

/**
 * Firestore converter for Household model
 */
export const householdConverter: FirestoreDataConverter<Household> = {
  toFirestore: (household: Household): DocumentData => ({
    name: household.name,
    createdBy: household.createdBy,
    memberIds: household.memberIds,
    activeCardIds: household.activeCardIds,
    createdAt: Timestamp.fromDate(household.createdAt),
    updatedAt: Timestamp.fromDate(household.updatedAt),
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Household => {
    const data = snapshot.data(options);
    return {
      id: asHouseholdId(snapshot.id),
      name: data.name,
      createdBy: asUserId(data.createdBy),
      memberIds: (data.memberIds || []).map((id: string) => asUserId(id)),
      activeCardIds: (data.activeCardIds || []).map((id: string) => asCardId(id)),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

/**
 * Firestore converter for CardTemplate model
 */
export const cardTemplateConverter: FirestoreDataConverter<CardTemplate> = {
  toFirestore: (card: CardTemplate): DocumentData => ({
    name: card.name,
    category: card.category,
    description: card.description,
    conceptionDescription: card.conceptionDescription,
    planningDescription: card.planningDescription,
    executionDescription: card.executionDescription,
    frequency: card.frequency,
    iconName: card.iconName,
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): CardTemplate => {
    const data = snapshot.data(options);
    return {
      id: asCardId(snapshot.id),
      name: data.name,
      category: data.category,
      description: data.description,
      conceptionDescription: data.conceptionDescription,
      planningDescription: data.planningDescription,
      executionDescription: data.executionDescription,
      frequency: data.frequency,
      iconName: data.iconName,
    };
  },
};

/**
 * Firestore converter for HouseholdCard model
 */
export const householdCardConverter: FirestoreDataConverter<HouseholdCard> = {
  toFirestore: (householdCard: HouseholdCard): DocumentData => ({
    householdId: householdCard.householdId,
    cardId: householdCard.cardId,
    currentOwner: householdCard.currentOwner || null,
    isActive: householdCard.isActive,
    assignmentHistory: householdCard.assignmentHistory.map((assignment) => ({
      assignedTo: assignment.assignedTo || null,
      assignedBy: assignment.assignedBy,
      assignedAt: Timestamp.fromDate(assignment.assignedAt),
      note: assignment.note || null,
    })),
    notes: householdCard.notes || null,
    createdAt: Timestamp.fromDate(householdCard.createdAt),
    updatedAt: Timestamp.fromDate(householdCard.updatedAt),
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): HouseholdCard => {
    const data = snapshot.data(options);
    return {
      id: asHouseholdCardId(snapshot.id),
      householdId: asHouseholdId(data.householdId),
      cardId: asCardId(data.cardId),
      currentOwner: data.currentOwner ? asUserId(data.currentOwner) : null,
      isActive: data.isActive,
      assignmentHistory: (data.assignmentHistory || []).map(
        (assignment: DocumentData) => ({
          assignedTo: assignment.assignedTo ? asUserId(assignment.assignedTo) : null,
          assignedBy: asUserId(assignment.assignedBy),
          assignedAt: timestampToDate(assignment.assignedAt),
          note: assignment.note || undefined,
        })
      ),
      notes: data.notes || undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

/**
 * Firestore converter for Invitation model
 */
export const invitationConverter: FirestoreDataConverter<Invitation> = {
  toFirestore: (invitation: Invitation): DocumentData => ({
    householdId: invitation.householdId,
    invitedBy: invitation.invitedBy,
    invitedEmail: invitation.invitedEmail,
    inviteCode: invitation.inviteCode,
    status: invitation.status,
    expiresAt: Timestamp.fromDate(invitation.expiresAt),
    createdAt: Timestamp.fromDate(invitation.createdAt),
    updatedAt: Timestamp.fromDate(invitation.updatedAt),
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Invitation => {
    const data = snapshot.data(options);
    return {
      id: asInvitationId(snapshot.id),
      householdId: asHouseholdId(data.householdId),
      invitedBy: asUserId(data.invitedBy),
      invitedEmail: data.invitedEmail,
      inviteCode: data.inviteCode,
      status: data.status,
      expiresAt: timestampToDate(data.expiresAt),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    };
  },
};

