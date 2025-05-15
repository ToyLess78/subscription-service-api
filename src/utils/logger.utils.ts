/**
 * Utility functions for logging
 */

/**
 * Represents a record with string keys and any type of values
 * This is a recursive type that allows for nested objects
 */
export type RecordWithNestedValues<T = unknown> = {
  [key: string]: T | RecordWithNestedValues<T>
}

/**
 * Redacts sensitive information from objects
 * @param obj The object to redact
 * @param paths Array of dot-notation paths to redact
 * @returns A new object with redacted values
 */
export function redactSensitiveInfo<T extends RecordWithNestedValues>(obj: T, paths: string[]): T {
  // Create a deep copy of the object to avoid mutating the original
  const result = JSON.parse(JSON.stringify(obj)) as T

  for (const path of paths) {
    const parts = path.split(".")

    // Start at the root of the object
    let current: RecordWithNestedValues = result
    let isValidPath = true

    // Navigate to the parent of the property to redact
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]

      // Check if the current part exists and is an object
      if (current[part] === undefined || current[part] === null || typeof current[part] !== "object") {
        isValidPath = false
        break
      }

      // Move to the next level
      current = current[part] as RecordWithNestedValues
    }

    // If we found a valid path, redact the property
    if (isValidPath) {
      const lastPart = parts[parts.length - 1]
      if (Object.prototype.hasOwnProperty.call(current, lastPart)) {
        current[lastPart] = "[REDACTED]"
      }
    }
  }

  return result
}

/**
 * Error information object with optional stack trace
 */
export interface ErrorInfo {
  message: string
  name: string
  stack?: string
  cause?: ErrorInfo
}

/**
 * Formats an error object for logging
 * @param error The error to format
 * @param includeStack Whether to include the stack trace
 * @returns A formatted error object
 */
export function formatError(error: Error, includeStack = false): ErrorInfo {
  const errorInfo: ErrorInfo = {
    message: error.message,
    name: error.name,
  }

  // Include stack trace if requested
  if (includeStack && error.stack) {
    errorInfo.stack = error.stack
  }

  // Include cause if it exists
  if ("cause" in error && error.cause instanceof Error) {
    errorInfo.cause = formatError(error.cause, includeStack)
  }

  return errorInfo
}

/**
 * Creates a standardized log message object
 * @param message The log message
 * @param data Additional data to include
 * @returns A formatted log object
 */
export function createLogMessage(message: string, data?: Record<string, unknown>): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    message,
    ...(data || {}),
  }
}
