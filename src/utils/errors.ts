import { ErrorMessage } from "../constants/error-message.enum"
import { HttpStatus } from "../constants/http-status.enum"

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly cause?: Error

  constructor(message: string, statusCode: number, options?: { isOperational?: boolean; cause?: Error }) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = options?.isOperational ?? true
    this.cause = options?.cause

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Specific error types
export class BadRequestError extends AppError {
  constructor(message = ErrorMessage.BAD_REQUEST, options?: { cause?: Error }) {
    super(message, HttpStatus.BAD_REQUEST, options)
  }
}

export class NotFoundError extends AppError {
  constructor(message = ErrorMessage.NOT_FOUND, options?: { cause?: Error }) {
    super(message, HttpStatus.NOT_FOUND, options)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = ErrorMessage.UNAUTHORIZED, options?: { cause?: Error }) {
    super(message, HttpStatus.UNAUTHORIZED, options)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = ErrorMessage.FORBIDDEN, options?: { cause?: Error }) {
    super(message, HttpStatus.FORBIDDEN, options)
  }
}

export class InternalServerError extends AppError {
  constructor(message = ErrorMessage.INTERNAL_SERVER_ERROR, options?: { cause?: Error }) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, { isOperational: false, ...options })
  }
}

// Weather-specific errors
export class WeatherApiError extends AppError {
  constructor(
    message = ErrorMessage.WEATHER_API_ERROR,
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    options?: { cause?: Error },
  ) {
    super(message, statusCode, options)
  }
}

export class InvalidCityError extends BadRequestError {
  constructor(city?: string, options?: { cause?: Error }) {
    super(`${ErrorMessage.INVALID_CITY}${city ? `: ${city}` : ""}`, options)
  }
}

// Database-specific errors
export class DatabaseError extends AppError {
  constructor(message = ErrorMessage.DATABASE_CONNECTION_ERROR, options?: { cause?: Error }) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, options)
  }
}
