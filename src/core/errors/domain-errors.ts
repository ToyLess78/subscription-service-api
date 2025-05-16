import { AppError } from "./app-error";
import { HttpStatus } from "../constants/http-status";
import { BadRequestError, ConflictError, NotFoundError } from "./http-errors";

/**
 * Database error
 */
export class DatabaseError extends AppError {
  constructor(
    message = "Database operation failed",
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}

/**
 * Email error
 */
export class EmailError extends AppError {
  constructor(message = "Email sending failed", options?: { cause?: Error }) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}

/**
 * Weather API error
 */
export class WeatherApiError extends AppError {
  constructor(
    message = "Weather API error",
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, statusCode, options);
  }
}

/**
 * Invalid city error
 */
export class InvalidCityError extends BadRequestError {
  constructor(city?: string, options?: { cause?: Error }) {
    const message = city
      ? `Invalid city name provided: ${city}`
      : "Invalid city name provided";
    super(message, options);
  }
}

/**
 * Subscription errors
 */
export class SubscriptionExistsError extends ConflictError {
  constructor(options?: { cause?: Error }) {
    super("Subscription already exists", options);
  }
}

export class SubscriptionNotFoundError extends NotFoundError {
  constructor(options?: { cause?: Error }) {
    super("Subscription not found", options);
  }
}

export class InvalidTokenError extends BadRequestError {
  constructor(options?: { cause?: Error }) {
    super("Invalid subscription token", options);
  }
}

export class ExpiredTokenError extends BadRequestError {
  constructor(options?: { cause?: Error }) {
    super("Expired subscription token", options);
  }
}
