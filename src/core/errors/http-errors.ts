import { AppError } from "./app-error";
import { HttpStatus } from "../constants/http-status";

/**
 * Bad request error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request", options?: { cause?: Error }) {
    super(message, HttpStatus.BAD_REQUEST, options);
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", options?: { cause?: Error }) {
    super(message, HttpStatus.UNAUTHORIZED, options);
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", options?: { cause?: Error }) {
    super(message, HttpStatus.FORBIDDEN, options);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", options?: { cause?: Error }) {
    super(message, HttpStatus.NOT_FOUND, options);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(
    message = "Resource already exists",
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.CONFLICT, options);
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", options?: { cause?: Error }) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, {
      isOperational: false,
      ...options,
    });
  }
}
