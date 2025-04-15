import { ErrorCode, ErrorMessages } from "./errorCodes";

/**
 * Base error class for application-specific errors
 * Extends Error to maintain stack trace and native error functionality
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    httpStatus: number,
    isOperational = true,
    details?: Record<string, unknown>
  ) {
    super(ErrorMessages[code]);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Factory functions for common error types
 */
export const createValidationError = (
  code: ErrorCode = ErrorCode.SYSTEM_VALIDATION_ERROR,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 400, true, details);
};

export const createAuthenticationError = (
  code: ErrorCode = ErrorCode.AUTH_INVALID_TOKEN,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 401, true, details);
};

export const createForbiddenError = (
  code: ErrorCode = ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 403, true, details);
};

export const createNotFoundError = (
  code: ErrorCode,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 404, true, details);
};

export const createConflictError = (
  code: ErrorCode,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 409, true, details);
};

export const createInternalError = (
  code: ErrorCode = ErrorCode.SYSTEM_INTERNAL_ERROR,
  details?: Record<string, unknown>
) => {
  return new AppError(code, 500, false, details);
};
