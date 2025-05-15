import { ErrorMessage } from "../constants/error-message.enum"
import { HttpStatus } from "../constants/http-status.enum"

// Base application error class
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// Specific error types
export class BadRequestError extends AppError {
  constructor(message = ErrorMessage.BAD_REQUEST) {
    super(message, HttpStatus.BAD_REQUEST)
  }
}

export class NotFoundError extends AppError {
  constructor(message = ErrorMessage.NOT_FOUND) {
    super(message, HttpStatus.NOT_FOUND)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = ErrorMessage.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = ErrorMessage.FORBIDDEN) {
    super(message, HttpStatus.FORBIDDEN)
  }
}

export class InternalServerError extends AppError {
  constructor(message = ErrorMessage.INTERNAL_SERVER_ERROR) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, false)
  }
}

// Weather-specific errors
export class WeatherApiError extends AppError {
  constructor(message = ErrorMessage.WEATHER_API_ERROR, statusCode = HttpStatus.INTERNAL_SERVER_ERROR) {
    super(message, statusCode)
  }
}

export class InvalidCityError extends BadRequestError {
  constructor(city?: string) {
    super(`${ErrorMessage.INVALID_CITY}${city ? `: ${city}` : ""}`)
  }
}
