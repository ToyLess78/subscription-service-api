/**
 * Utility functions for logging
 */

/**
 * Redacts sensitive information from objects
 * @param obj The object to redact
 * @param paths Array of dot-notation paths to redact
 * @returns A new object with redacted values
 */
export function redactSensitiveInfo<T extends Record<string, any>>(obj: T, paths: string[]): T {
  const result = { ...obj }

  for (const path of paths) {
    const parts = path.split(".")
    let current: any = result

    // Navigate to the parent of the property to redact
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        break
      }
      current = current[parts[i]]
    }

    // Redact the property if it exists
    const lastPart = parts[parts.length - 1]
    if (current && current[lastPart] !== undefined) {
      current[lastPart] = "[REDACTED]"
    }
  }

  return result
}

/**
 * Formats an error object for logging
 * @param error The error to format
 * @param includeStack Whether to include the stack trace
 * @returns A formatted error object
 */
export function formatError(error: Error, includeStack = false): Record<string, any> {
  return {
    message: error.message,
    name: error.name,
    ...(includeStack && error.stack ? { stack: error.stack } : {}),
  }
}

/**
 * Creates a standardized log message object
 * @param message The log message
 * @param data Additional data to include
 * @returns A formatted log object
 */
export function createLogMessage(message: string, data?: Record<string, any>): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    message,
    ...(data || {}),
  }
}
