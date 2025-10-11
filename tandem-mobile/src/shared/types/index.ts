/**
 * Shared types index
 * Re-exports all shared types for easy importing
 */

export * from './branded';
export * from './enums';

/**
 * Common result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Common error types
 */
export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

