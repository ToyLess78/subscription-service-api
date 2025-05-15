/**
 * Centralized error messages for the application
 * This ensures consistency in error messages and makes it easier to update them
 */
export enum ErrorMessage {
  // General errors
  INTERNAL_SERVER_ERROR = "An unexpected error occurred",
  BAD_REQUEST = "Bad request",
  NOT_FOUND = "Resource not found",
  UNAUTHORIZED = "Unauthorized",
  FORBIDDEN = "Forbidden",

  // Validation errors
  VALIDATION_ERROR = "Validation error",
  MISSING_REQUIRED_FIELD = "Missing required field",

  // Weather API errors
  WEATHER_API_ERROR = "Weather API error",
  INVALID_CITY = "Invalid city name provided",
  MISSING_CITY = "City parameter is required",
  WEATHER_API_UNAUTHORIZED = "Invalid or unauthorized API key",
  FAILED_TO_FETCH_WEATHER = "Failed to fetch weather data",

  // Configuration errors
  MISSING_ENV_VARIABLE = "Missing required environment variable",
  INVALID_ENV_VARIABLE = "Invalid environment variable",

  // Route errors
  ROUTE_NOT_FOUND = "Route not found",

  // Database errors
  DATABASE_CONNECTION_ERROR = "Failed to connect to database",
  DATABASE_QUERY_ERROR = "Database query failed",
}
