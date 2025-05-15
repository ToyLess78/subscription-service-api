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
  constructor(message = "Bad request") {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403)
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, false)
  }
}

// Weather-specific errors
export class WeatherApiError extends AppError {
  constructor(message = "Weather API error", statusCode = 500) {
    super(message, statusCode)
  }
}

export class InvalidCityError extends BadRequestError {
  constructor(city?: string) {
    super(`Invalid city name provided${city ? `: ${city}` : ""}`)
  }
}
