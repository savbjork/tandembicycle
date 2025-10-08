/**
 * Constants index
 */

export * from './cardTemplates';

/**
 * App constants
 */
export const APP_NAME = 'Fair Play';
export const APP_VERSION = '1.0.0';

/**
 * Firestore constants
 */
export const ITEMS_PER_PAGE = 20;
export const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Invitation constants
 */
export const INVITATION_EXPIRY_DAYS = 7;
export const INVITE_CODE_LENGTH = 8;

/**
 * Validation constants
 */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_NAME_LENGTH = 50;
export const MIN_HOUSEHOLD_MEMBERS = 1;
export const MAX_HOUSEHOLD_MEMBERS = 10;

/**
 * UI constants
 */
export const TOAST_DURATION = 3000;
export const DEBOUNCE_DELAY = 300;
export const ANIMATION_DURATION = 200;

