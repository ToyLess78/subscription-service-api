import { ErrorMessage, HttpStatus } from "../core/constants";

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly cause?: Error;

  constructor(
    message: string,
    statusCode: number,
    options?: { isOperational?: boolean; cause?: Error },
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = options?.isOperational ?? true;
    this.cause = options?.cause;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
export class BadRequestError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.BAD_REQUEST,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.BAD_REQUEST, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.NOT_FOUND,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.NOT_FOUND, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.UNAUTHORIZED,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.UNAUTHORIZED, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.FORBIDDEN,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.FORBIDDEN, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.INTERNAL_SERVER_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, {
      isOperational: false,
      ...options,
    });

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

// Weather-specific errors
export class WeatherApiError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.WEATHER_API_ERROR,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, statusCode, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, WeatherApiError.prototype);
  }
}

export class InvalidCityError extends BadRequestError {
  constructor(city?: string, options?: { cause?: Error }) {
    // Fix: Use string concatenation instead of template literals
    const message = city
      ? `${ErrorMessage.INVALID_CITY}: ${city}`
      : ErrorMessage.INVALID_CITY;
    super(message, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, InvalidCityError.prototype);
  }
}

// Database-specific errors
export class DatabaseError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.DATABASE_CONNECTION_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

// Email-specific errors
export class EmailError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.EMAIL_SENDING_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, EmailError.prototype);
  }
}

// Subscription-specific errors
export class SubscriptionError extends AppError {
  constructor(
    message: string | ErrorMessage = ErrorMessage.SUBSCRIPTION_NOT_FOUND,
    statusCode = HttpStatus.BAD_REQUEST,
    options?: { cause?: Error },
  ) {
    super(message, statusCode, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, SubscriptionError.prototype);
  }
}

export class SubscriptionExistsError extends SubscriptionError {
  constructor(options?: { cause?: Error }) {
    super(
      ErrorMessage.SUBSCRIPTION_ALREADY_EXISTS,
      HttpStatus.CONFLICT,
      options,
    );

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, SubscriptionExistsError.prototype);
  }
}

export class SubscriptionNotFoundError extends SubscriptionError {
  constructor(options?: { cause?: Error }) {
    super(ErrorMessage.SUBSCRIPTION_NOT_FOUND, HttpStatus.NOT_FOUND, options);

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, SubscriptionNotFoundError.prototype);
  }
}

export class InvalidTokenError extends SubscriptionError {
  constructor(options?: { cause?: Error }) {
    super(
      ErrorMessage.INVALID_SUBSCRIPTION_TOKEN,
      HttpStatus.BAD_REQUEST,
      options,
    );

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class ExpiredTokenError extends SubscriptionError {
  constructor(options?: { cause?: Error }) {
    super(
      ErrorMessage.EXPIRED_SUBSCRIPTION_TOKEN,
      HttpStatus.BAD_REQUEST,
      options,
    );

    // Set the prototype explicitly for each error class
    Object.setPrototypeOf(this, ExpiredTokenError.prototype);
  }
}
