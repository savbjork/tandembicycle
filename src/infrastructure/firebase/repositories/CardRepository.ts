import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  documentId,
} from 'firebase/firestore';
import { ICardRepository } from '@core/repositories/ICardRepository';
import { CardTemplate } from '@core/models/Card';
import { CardId, CardCategory, AsyncResult, ErrorCode } from '@shared/types';
import { getFirebaseFirestore } from '../config';
import { Collections } from '../collections';
import { cardTemplateConverter } from '../converters';

export class CardRepository implements ICardRepository {
  private get cardsCollection() {
    return collection(getFirebaseFirestore(), Collections.CARD_TEMPLATES).withConverter(
      cardTemplateConverter
    );
  }

  async getAll(): AsyncResult<CardTemplate[]> {
    try {
      const querySnapshot = await getDocs(this.cardsCollection);
      const cards = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: cards };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch card templates',
          details: error,
        },
      };
    }
  }

  async getById(cardId: CardId): AsyncResult<CardTemplate> {
    try {
      const cardRef = doc(this.cardsCollection, cardId);
      const cardDoc = await getDoc(cardRef);

      if (!cardDoc.exists()) {
        return {
          success: false,
          error: {
            code: ErrorCode.NOT_FOUND,
            message: 'Card template not found',
          },
        };
      }

      return { success: true, data: cardDoc.data() };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch card template',
          details: error,
        },
      };
    }
  }

  async getByCategory(category: CardCategory): AsyncResult<CardTemplate[]> {
    try {
      const q = query(this.cardsCollection, where('category', '==', category));
      const querySnapshot = await getDocs(q);
      const cards = querySnapshot.docs.map((doc) => doc.data());
      return { success: true, data: cards };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch cards by category',
          details: error,
        },
      };
    }
  }

  async getByIds(cardIds: CardId[]): AsyncResult<CardTemplate[]> {
    try {
      if (cardIds.length === 0) {
        return { success: true, data: [] };
      }

      // Firestore 'in' queries are limited to 10 items, so we batch
      const batchSize = 10;
      const batches: CardTemplate[] = [];

      for (let i = 0; i < cardIds.length; i += batchSize) {
        const batchIds = cardIds.slice(i, i + batchSize);
        const q = query(this.cardsCollection, where(documentId(), 'in', batchIds));
        const querySnapshot = await getDocs(q);
        batches.push(...querySnapshot.docs.map((doc) => doc.data()));
      }

      return { success: true, data: batches };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ErrorCode.UNKNOWN,
          message: 'Failed to fetch cards by IDs',
          details: error,
        },
      };
    }
  }
}

