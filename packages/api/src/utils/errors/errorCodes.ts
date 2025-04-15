/**
 * Enum containing all possible error codes in the application.
 * Each code is prefixed with the module it belongs to.
 * Format: E[MODULE][NUMBER]
 *
 * Ranges:
 * - AUTH: 1000-1999
 * - VALIDATION: 2000-2999
 * - CLOTHES: 3000-3999
 * - OUTFIT: 4000-4999
 * - POST: 5000-5999
 * - SOCIAL: 6000-6999
 * - BRAND: 7000-7999
 * - SYSTEM: 9000-9999
 */
export enum ErrorCode {
  // Auth errors (E1xxx)
  AUTH_INVALID_CREDENTIALS = "E1001",
  AUTH_INSUFFICIENT_PERMISSIONS = "E1002",
  AUTH_INVALID_TOKEN = "E1003",
  AUTH_MISSING_TOKEN = "E1004",

  // User errors (E2xxx)
  USER_NOT_FOUND = "E2001",
  USER_ALREADY_EXISTS = "E2002",
  USER_INVALID_DATA = "E2003",
  USER_ALREADY_FOLLOWING = "E2004",
  USER_NOT_FOLLOWING = "E2005",

  // System errors (E9xxx)
  SYSTEM_INTERNAL_ERROR = "E9001",
  SYSTEM_VALIDATION_ERROR = "E9002",
  SYSTEM_EXTERNAL_SERVICE_ERROR = "E9003",
  SYSTEM_RATE_LIMIT_EXCEEDED = "E9004",
}

/**
 * Maps error codes to their user-friendly messages
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Auth errors
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: "Invalid credentials",
  [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]:
    "Insufficient permissions for this action",
  [ErrorCode.AUTH_INVALID_TOKEN]: "Invalid authentication token",
  [ErrorCode.AUTH_MISSING_TOKEN]: "Authentication token is missing",

  // User errors
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.USER_ALREADY_EXISTS]: "User already exists",
  [ErrorCode.USER_INVALID_DATA]: "Invalid user data",
  [ErrorCode.USER_ALREADY_FOLLOWING]: "Already following this user",
  [ErrorCode.USER_NOT_FOLLOWING]: "Not following this user",

  // System errors
  [ErrorCode.SYSTEM_INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.SYSTEM_VALIDATION_ERROR]: "Validation error",
  [ErrorCode.SYSTEM_EXTERNAL_SERVICE_ERROR]: "External service error",
  [ErrorCode.SYSTEM_RATE_LIMIT_EXCEEDED]: "Rate limit exceeded",
};
