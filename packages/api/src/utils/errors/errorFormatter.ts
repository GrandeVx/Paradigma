import { TRPCError } from "@trpc/server";
import { AppError } from "./AppError";
import { ErrorCode } from "./errorCodes";
import { errorLogger } from "./errorLogger";

type TRPCErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | "PARSE_ERROR"
  | "NOT_IMPLEMENTED"
  | "METHOD_NOT_SUPPORTED"
  | "TIMEOUT"
  | "PRECONDITION_FAILED"
  | "PAYLOAD_TOO_LARGE"
  | "CLIENT_CLOSED_REQUEST";

/**
 * Maps HTTP status codes to TRPC error codes
 */
const httpStatusToTRPCError: Record<number, TRPCErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "TOO_MANY_REQUESTS",
  500: "INTERNAL_SERVER_ERROR",
};

/**
 * Formats an error for TRPC response
 * Handles both AppError and other types of errors
 */
export function formatError(error: unknown): TRPCError {
  // Log the error
  errorLogger.logError(
    error instanceof Error ? error : new Error(String(error))
  );

  // Handle AppError
  if (error instanceof AppError) {
    const trpcCode =
      httpStatusToTRPCError[error.httpStatus] || "INTERNAL_SERVER_ERROR";
    return new TRPCError({
      code: trpcCode,
      message: error.message,
      cause: error,
    });
  }

  // Handle TRPC errors
  if (error instanceof TRPCError) {
    return error;
  }

  // Handle Prisma errors
  if (
    error instanceof Error &&
    error.name === "PrismaClientKnownRequestError"
  ) {
    return new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database operation failed",
      cause: error,
    });
  }

  // Handle unknown errors
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    cause: error instanceof Error ? error : new Error(String(error)),
  });
}

/**
 * Creates a TRPC error from an error code
 */
export function createTRPCError(
  code: ErrorCode,
  details?: Record<string, unknown>
): TRPCError {
  const appError = new AppError(code, 500, true, details);
  return formatError(appError);
}
