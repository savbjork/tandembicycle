import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { IUserRepository } from '@core/repositories/IUserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '@core/models/User';
import { UserId, HouseholdId, AsyncResult, ErrorCode } from '@shared/types';
import { getFirebaseFirestore } from '../config';
import { Collections } from '../collections';
import { userConverter } from '../converters';

export class UserRepository implements IUserRepository {
  private get usersCollection() {
    return collection(getFirebaseFirestore(), Collections.USERS).withConverter(
      userConverter
    );
  }

  async create(userId: UserId, data: CreateUserDTO): AsyncResult<User> {
    try {
      const now = new Date();
      const user: User = {
        id: userId,
        ...data,
        currentHouseholdId: undefined,
        householdIds: [],
        createdAt: now,
        updatedAt: now,
      };

      const userRef = doc(this.usersCollection, userId);
      await setDoc(userRef, user);

      return { success: true, data: user };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to create user',
          details: error,
        },
      };
    }
  }

  async getById(userId: UserId): AsyncResult<User> {
    try {
      const userRef = doc(this.usersCollection, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'User not found',
          },
        };
      }

      return { success: true, data: userDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch user',
          details: error,
        },
      };
    }
  }

  async getByEmail(email: string): AsyncResult<User | null> {
    try {
      const q = query(this.usersCollection, where('email', '==', email));
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
          message: 'Failed to fetch user by email',
          details: error,
        },
      };
    }
  }

  async update(userId: UserId, data: UpdateUserDTO): AsyncResult<User> {
    try {
      const userRef = doc(this.usersCollection, userId);
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);

      const updatedDoc = await getDoc(userRef);
      if (!updatedDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'User not found after update',
          },
        };
      }

      return { success: true, data: updatedDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to update user',
          details: error,
        },
      };
    }
  }

  async delete(userId: UserId): AsyncResult<void> {
    try {
      const userRef = doc(this.usersCollection, userId);
      await deleteDoc(userRef);
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to delete user',
          details: error,
        },
      };
    }
  }

  async addHousehold(userId: UserId, householdId: HouseholdId): AsyncResult<void> {
    try {
      const userRef = doc(this.usersCollection, userId);
      await updateDoc(userRef, {
        householdIds: arrayUnion(householdId),
        updatedAt: new Date(),
      });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to add household to user',
          details: error,
        },
      };
    }
  }

  async removeHousehold(userId: UserId, householdId: HouseholdId): AsyncResult<void> {
    try {
      const userRef = doc(this.usersCollection, userId);
      await updateDoc(userRef, {
        householdIds: arrayRemove(householdId),
        updatedAt: new Date(),
      });
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to remove household from user',
          details: error,
        },
      };
    }
  }
}

