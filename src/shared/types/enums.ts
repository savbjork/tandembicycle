/**
 * Core enumerations for the Fair Play application
 */

export enum CardCategory {
  HOME_CARE = 'home_care',
  FOOD_MEALS = 'food_meals',
  CHILDCARE = 'childcare',
  FINANCIAL = 'financial',
  SOCIAL_FAMILY = 'social_family',
  PERSONAL_CARE = 'personal_care',
}

export enum TaskFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  AS_NEEDED = 'as_needed',
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  DECLINED = 'declined',
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

/**
 * Display labels for categories
 */
export const CategoryLabels: Record<CardCategory, string> = {
  [CardCategory.HOME_CARE]: 'Home Care',
  [CardCategory.FOOD_MEALS]: 'Food & Meals',
  [CardCategory.CHILDCARE]: 'Childcare',
  [CardCategory.FINANCIAL]: 'Financial',
  [CardCategory.SOCIAL_FAMILY]: 'Social & Family',
  [CardCategory.PERSONAL_CARE]: 'Personal Care',
};

/**
 * Display labels for frequencies
 */
export const FrequencyLabels: Record<TaskFrequency, string> = {
  [TaskFrequency.DAILY]: 'Daily',
  [TaskFrequency.WEEKLY]: 'Weekly',
  [TaskFrequency.MONTHLY]: 'Monthly',
  [TaskFrequency.SEASONAL]: 'Seasonal',
  [TaskFrequency.AS_NEEDED]: 'As Needed',
};

/**
 * Category color mappings for UI
 */
export const CategoryColors: Record<CardCategory, string> = {
  [CardCategory.HOME_CARE]: 'bg-blue-100',
  [CardCategory.FOOD_MEALS]: 'bg-amber-100',
  [CardCategory.CHILDCARE]: 'bg-purple-100',
  [CardCategory.FINANCIAL]: 'bg-green-100',
  [CardCategory.SOCIAL_FAMILY]: 'bg-pink-100',
  [CardCategory.PERSONAL_CARE]: 'bg-indigo-100',
};

