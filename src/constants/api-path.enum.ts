/**
 * Centralized API paths for the application
 * This ensures consistency in API paths and makes it easier to update them
 */
export enum ApiPath {
  // Base paths
  BASE = "/api",

  // Version paths
  V1 = "/v1",

  // Weather paths
  WEATHER = "/weather",
  WEATHER_CURRENT = "/weather/current",

  // Subscription paths
  SUBSCRIBE = "/subscribe",
  CONFIRM = "/confirm",
  UNSUBSCRIBE = "/unsubscribe",

  // System paths
  HEALTH = "/health",
  DOCUMENTATION = "/documentation",

  // Static paths
  STATIC = "/",
  INDEX = "/index.html",
}

/**
 * Helper function to build API paths
 * @param version API version
 * @param path API path
 * @returns Full API path
 */
export function buildApiPath(version: string, path: string): string {
  return `${ApiPath.BASE}/${version}${path}`
}

/**
 * Helper function to build versioned API paths using the V1 version
 * @param path API path
 * @returns Full API path with V1 version
 */
export function buildV1ApiPath(path: string): string {
  return buildApiPath("v1", path)
}
