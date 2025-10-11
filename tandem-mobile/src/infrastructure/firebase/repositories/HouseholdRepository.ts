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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { IHouseholdRepository } from '@core/repositories/IHouseholdRepository';
import {
  Household,
  CreateHouseholdDTO,
  UpdateHouseholdDTO,
  HouseholdMember,
} from '@core/models/Household';
import { HouseholdId, UserId, AsyncResult, ErrorCode, asHouseholdId } from '@shared/types';
import { getFirebaseFirestore } from '../config';
import { Collections } from '../collections';
import { householdConverter, userConverter } from '../converters';

export class HouseholdRepository implements IHouseholdRepository {
  private get householdsCollection() {
    return collection(getFirebaseFirestore(), Collections.HOUSEHOLDS).withConverter(
      householdConverter
    );
  }

  private get usersCollection() {
    return collection(getFirebaseFirestore(), Collections.USERS).withConverter(
      userConverter
    );
  }

  async create(createdBy: UserId, data: CreateHouseholdDTO): AsyncResult<Household> {
    try {
      const now = new Date();
      const householdRef = doc(this.householdsCollection);
      const household: Household = {
        id: asHouseholdId(householdRef.id),
        name: data.name,
        createdBy,
        memberIds: [createdBy],
        activeCardIds: [],
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(householdRef, household);

      return { success: true, data: household };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to create household',
          details: error,
        },
      };
    }
  }

  async getById(householdId: HouseholdId): AsyncResult<Household> {
    try {
      const householdRef = doc(this.householdsCollection, householdId);
      const householdDoc = await getDoc(householdRef);

      if (!householdDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Household not found',
          },
        };
      }

      return { success: true, data: householdDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch household',
          details: error,
        },
      };
    }
  }

  async getByUserId(userId: UserId): AsyncResult<Household[]> {
    try {
      const q = query(
        this.householdsCollection,
        where('memberIds', 'array-contains', userId)
      );
      const querySnapshot = await getDocs(q);
      const households = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: households };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch households for user',
          details: error,
        },
      };
    }
  }

  async update(
    householdId: HouseholdId,
    data: UpdateHouseholdDTO
  ): AsyncResult<Household> {
    try {
      const householdRef = doc(this.householdsCollection, householdId);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(householdRef, updateData);

      const updatedDoc = await getDoc(householdRef);
      if (!updatedDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Household not found after update',
          },
        };
      }

      return { success: true, data: updatedDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to update household',
          details: error,
        },
      };
    }
  }

  async delete(householdId: HouseholdId): AsyncResult<void> {
    try {
      const householdRef = doc(this.householdsCollection, householdId);
      await deleteDoc(householdRef);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to delete household',
          details: error,
        },
      };
    }
  }

  async addMember(householdId: HouseholdId, userId: UserId): AsyncResult<void> {
    try {
      const householdRef = doc(this.householdsCollection, householdId);
      await updateDoc(householdRef, {
        memberIds: arrayUnion(userId),
        updatedAt: new Date(),
      });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to add member to household',
          details: error,
        },
      };
    }
  }

  async removeMember(householdId: HouseholdId, userId: UserId): AsyncResult<void> {
    try {
      const householdRef = doc(this.householdsCollection, householdId);
      await updateDoc(householdRef, {
        memberIds: arrayRemove(userId),
        updatedAt: new Date(),
      });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to remove member from household',
          details: error,
        },
      };
    }
  }

  async getMembers(householdId: HouseholdId): AsyncResult<HouseholdMember[]> {
    try {
      // First get the household to get member IDs
      const householdResult = await this.getById(householdId);
      if (!householdResult.success) {
        return householdResult;
      }

      const household = householdResult.data;
      if (household.memberIds.length === 0) {
        return { success: true, data: [] };
      }

      // Fetch user documents for all members
      const memberPromises = household.memberIds.map(async (userId) => {
        const userRef = doc(this.usersCollection, userId);
        const userDoc = await getDoc(userRef);
        return userDoc.exists() ? userDoc.data() : null;
      });

      const members = (await Promise.all(memberPromises)).filter(
        (user) => user !== null
      );

      const householdMembers: HouseholdMember[] = members.map((user) => ({
        userId: user!.id,
        name: user!.name,
        email: user!.email,
        avatar: user!.avatar,
        joinedAt: user!.createdAt,
      }));

      return { success: true, data: householdMembers };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch household members',
          details: error,
        },
      };
    }
  }
}

