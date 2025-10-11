import { z } from 'zod';

/**
 * Common validation schemas using Zod
 */

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const householdNameSchema = z
  .string()
  .min(2, 'Household name must be at least 2 characters')
  .max(50, 'Household name must be less than 50 characters');

/**
 * Authentication schemas
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Household schemas
 */
export const createHouseholdSchema = z.object({
  name: householdNameSchema,
});

export const inviteMemberSchema = z.object({
  email: emailSchema,
});

/**
 * Profile schemas
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  avatar: z.string().url('Please enter a valid URL').optional(),
});

/**
 * Type inference from schemas
 */
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type CreateHouseholdFormData = z.infer<typeof createHouseholdSchema>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

