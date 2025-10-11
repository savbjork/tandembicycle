import { CardTemplate } from '@core/models/Card';
import { CardId } from '@shared/types';
import { CardCategory } from '@shared/types';
import { AsyncResult } from '@shared/types';

/**
 * Card repository interface
 * Defines operations for card template data access
 */
export interface ICardRepository {
  /**
   * Get all card templates
   */
  getAll(): AsyncResult<CardTemplate[]>;

  /**
   * Get card template by ID
   */
  getById(cardId: CardId): AsyncResult<CardTemplate>;

  /**
   * Get card templates by category
   */
  getByCategory(category: CardCategory): AsyncResult<CardTemplate[]>;

  /**
   * Get multiple cards by their IDs
   */
  getByIds(cardIds: CardId[]): AsyncResult<CardTemplate[]>;
}

