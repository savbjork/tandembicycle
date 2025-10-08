/**
 * Branded types for type-safe IDs
 * Prevents mixing different ID types at compile time
 */

declare const brand: unique symbol;

type Brand<T, TBrand> = T & { readonly [brand]: TBrand };

export type UserId = Brand<string, 'UserId'>;
export type HouseholdId = Brand<string, 'HouseholdId'>;
export type CardId = Brand<string, 'CardId'>;
export type HouseholdCardId = Brand<string, 'HouseholdCardId'>;
export type InvitationId = Brand<string, 'InvitationId'>;

/**
 * Helper functions to create branded types
 */
export const asUserId = (id: string): UserId => id as UserId;
export const asHouseholdId = (id: string): HouseholdId => id as HouseholdId;
export const asCardId = (id: string): CardId => id as CardId;
export const asHouseholdCardId = (id: string): HouseholdCardId => id as HouseholdCardId;
export const asInvitationId = (id: string): InvitationId => id as InvitationId;

