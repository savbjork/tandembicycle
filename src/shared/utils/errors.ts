import { ErrorCode, AppError } from '@shared/types';

/**
 * Custom error classes for the application
 */

export class FairPlayError extends Error {
  code: ErrorCode;
  details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'FairPlayError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, FairPlayError.prototype);
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class AuthenticationError extends FairPlayError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.AUTHENTICATION, message, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends FairPlayError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.AUTHORIZATION, message, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends FairPlayError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.NOT_FOUND, message, details);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends FairPlayError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.VALIDATION, message, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends FairPlayError {
  constructor(message: string, details?: unknown) {
    super(ErrorCode.NETWORK, message, details);
    this.name = 'NetworkError';
  }
}

/**
 * Convert unknown errors to AppError
 */
export const toAppError = (error: unknown): AppError => {
  if (error instanceof FairPlayError) {
    return error.toAppError();
  }

  if (error instanceof Error) {
    return {
      code: ErrorCode.UNKNOWN,
      message: error.message,
      details: error,
    };
  }

  return {
    code: ErrorCode.UNKNOWN,
    message: 'An unknown error occurred',
    details: error,
  };
};

