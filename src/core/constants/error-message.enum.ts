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

  // Database errors
  DATABASE_CONNECTION_ERROR = "Failed to connect to database",
  DATABASE_QUERY_ERROR = "Database query failed",
  DATABASE_URL_MISSING = "Database URL is missing or invalid",
  DATABASE_CONNECTION_TIMEOUT = "Database connection timed out",
  DATABASE_NOT_CONNECTED = "Database is not connected",
  DATABASE_DISCONNECTION_ERROR = "Failed to disconnect from database",

  // Email errors
  EMAIL_SENDING_ERROR = "Failed to send email",

  // Subscription errors
  SUBSCRIPTION_ALREADY_EXISTS = "Subscription already exists",
  SUBSCRIPTION_NOT_FOUND = "Subscription not found",
  INVALID_SUBSCRIPTION_TOKEN = "Invalid subscription token",
  EXPIRED_SUBSCRIPTION_TOKEN = "Subscription token has expired",
  INVALID_FREQUENCY = "Invalid frequency. Must be 'hourly' or 'daily'",
}
