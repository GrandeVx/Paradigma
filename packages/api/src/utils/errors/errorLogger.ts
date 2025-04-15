import { AppError } from "./AppError";

/**
 * Error logging service
 * In production, this should be connected to a proper logging service
 * like Winston, Pino, or a cloud logging service
 */
class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log an error with appropriate level and details
   */
  public logError(error: Error | AppError): void {
    if (this.isDevelopment) {
      this.logDevelopmentError(error);
    } else {
      this.logProductionError(error);
    }
  }

  /**
   * Detailed logging for development environment
   */
  private logDevelopmentError(error: Error | AppError): void {
    console.error("🔥 Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        httpStatus: error.httpStatus,
        isOperational: error.isOperational,
        details: error.details,
      }),
    });
  }

  /**
   * Sanitized logging for production environment
   */
  private logProductionError(error: Error | AppError): void {
    // In production, we should send this to a proper logging service
    const errorLog = {
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      ...(error instanceof AppError && {
        code: error.code,
        httpStatus: error.httpStatus,
        isOperational: error.isOperational,
      }),
      sanitizedDetails:
        error instanceof AppError && error.details
          ? this.sanitizeErrorDetails(error.details)
          : undefined,
    };

    // Avoid logging sensitive information in production
    if (error instanceof AppError && error.details) {
      errorLog["sanitizedDetails"] = this.sanitizeErrorDetails(error.details);
    }

    console.error("Error:", errorLog);
  }

  /**
   * Remove sensitive information from error details
   */
  private sanitizeErrorDetails(
    details: Record<string, unknown>
  ): Record<string, unknown> {
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...details };

    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeErrorDetails(
          value as Record<string, unknown>
        );
      } else if (
        sensitiveFields.some((field) => key.toLowerCase().includes(field))
      ) {
        sanitized[key] = "[REDACTED]";
      }
    }

    return sanitized;
  }
}

export const errorLogger = new ErrorLogger();
