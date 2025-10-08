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
  and as firestoreAnd,
} from 'firebase/firestore';
import { IHouseholdCardRepository } from '@core/repositories/IHouseholdCardRepository';
import {
  HouseholdCard,
  CreateHouseholdCardDTO,
  UpdateHouseholdCardDTO,
  AssignCardDTO,
} from '@core/models/HouseholdCard';
import {
  HouseholdCardId,
  HouseholdId,
  UserId,
  CardId,
  AsyncResult,
  ErrorCode,
  asHouseholdCardId,
} from '@shared/types';
import { getFirebaseFirestore } from '../config';
import { Collections } from '../collections';
import { householdCardConverter } from '../converters';

export class HouseholdCardRepository implements IHouseholdCardRepository {
  private get householdCardsCollection() {
    return collection(
      getFirebaseFirestore(),
      Collections.HOUSEHOLD_CARDS
    ).withConverter(householdCardConverter);
  }

  async create(data: CreateHouseholdCardDTO): AsyncResult<HouseholdCard> {
    try {
      const now = new Date();
      const cardRef = doc(this.householdCardsCollection);
      const householdCard: HouseholdCard = {
        id: asHouseholdCardId(cardRef.id),
        householdId: data.householdId,
        cardId: data.cardId,
        currentOwner: data.currentOwner || null,
        isActive: true,
        assignmentHistory: data.currentOwner
          ? [
              {
                assignedTo: data.currentOwner,
                assignedBy: data.currentOwner,
                assignedAt: now,
              },
            ]
          : [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(cardRef, householdCard);

      return { success: true, data: householdCard };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to create household card',
          details: error,
        },
      };
    }
  }

  async getById(householdCardId: HouseholdCardId): AsyncResult<HouseholdCard> {
    try {
      const cardRef = doc(this.householdCardsCollection, householdCardId);
      const cardDoc = await getDoc(cardRef);

      if (!cardDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Household card not found',
          },
        };
      }

      return { success: true, data: cardDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch household card',
          details: error,
        },
      };
    }
  }

  async getByHouseholdId(householdId: HouseholdId): AsyncResult<HouseholdCard[]> {
    try {
      const q = query(
        this.householdCardsCollection,
        where('householdId', '==', householdId)
      );
      const querySnapshot = await getDocs(q);
      const cards = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: cards };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch household cards',
          details: error,
        },
      };
    }
  }

  async getByOwner(
    householdId: HouseholdId,
    userId: UserId
  ): AsyncResult<HouseholdCard[]> {
    try {
      const q = query(
        this.householdCardsCollection,
        firestoreAnd(
          where('householdId', '==', householdId),
          where('currentOwner', '==', userId),
          where('isActive', '==', true)
        )
      );
      const querySnapshot = await getDocs(q);
      const cards = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: cards };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch cards by owner',
          details: error,
        },
      };
    }
  }

  async update(
    householdCardId: HouseholdCardId,
    data: UpdateHouseholdCardDTO
  ): AsyncResult<HouseholdCard> {
    try {
      const cardRef = doc(this.householdCardsCollection, householdCardId);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(cardRef, updateData);

      const updatedDoc = await getDoc(cardRef);
      if (!updatedDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Household card not found after update',
          },
        };
      }

      return { success: true, data: updatedDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to update household card',
          details: error,
        },
      };
    }
  }

  async assignCard(
    householdCardId: HouseholdCardId,
    assignment: AssignCardDTO
  ): AsyncResult<HouseholdCard> {
    try {
      const cardRef = doc(this.householdCardsCollection, householdCardId);
      const cardDoc = await getDoc(cardRef);

      if (!cardDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Household card not found',
          },
        };
      }

      const card = cardDoc.data();
      const newAssignment = {
        assignedTo: assignment.assignedTo,
        assignedBy: assignment.assignedBy,
        assignedAt: new Date(),
        note: assignment.note,
      };

      const updatedCard: HouseholdCard = {
        ...card,
        currentOwner: assignment.assignedTo,
        assignmentHistory: [...card.assignmentHistory, newAssignment],
        updatedAt: new Date(),
      };

      await setDoc(cardRef, updatedCard);

      return { success: true, data: updatedCard };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to assign card',
          details: error,
        },
      };
    }
  }

  async delete(householdCardId: HouseholdCardId): AsyncResult<void> {
    try {
      const cardRef = doc(this.householdCardsCollection, householdCardId);
      await deleteDoc(cardRef);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to delete household card',
          details: error,
        },
      };
    }
  }

  async existsByCardId(
    householdId: HouseholdId,
    cardId: CardId
  ): AsyncResult<boolean> {
    try {
      const q = query(
        this.householdCardsCollection,
        firestoreAnd(
          where('householdId', '==', householdId),
          where('cardId', '==', cardId)
        )
      );
      const querySnapshot = await getDocs(q);
      return { success: true, data: !querySnapshot.empty };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to check if card exists',
          details: error,
        },
      };
    }
  }
}

