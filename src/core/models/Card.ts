import { CardId } from '@shared/types/branded';
import { CardCategory, TaskFrequency } from '@shared/types/enums';

/**
 * CardTemplate domain model
 * Represents the master template for a Fair Play card
 * These are predefined and don't change per household
 */
export interface CardTemplate {
  id: CardId;
  name: string;
  category: CardCategory;
  description: string;
  conceptionDescription: string;
  planningDescription: string;
  executionDescription: string;
  frequency: TaskFrequency;
  iconName: string;
}

/**
 * Card template creation data (for seeding database)
 */
export interface CreateCardTemplateDTO {
  name: string;
  category: CardCategory;
  description: string;
  conceptionDescription: string;
  planningDescription: string;
  executionDescription: string;
  frequency: TaskFrequency;
  iconName: string;
}

