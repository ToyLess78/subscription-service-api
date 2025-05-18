/**
 * Centralized API paths for the application
 * This ensures consistency in API paths and makes it easier to update them
 */
export enum ApiPath {
  // Base paths
  BASE = "/api",

  // Weather paths
  WEATHER = "/weather",

  // Subscription paths
  SUBSCRIBE = "/subscribe",
  CONFIRM = "/confirm",
  UNSUBSCRIBE = "/unsubscribe",

  // System paths
  HEALTH = "/health",
  DOCUMENTATION = "/documentation",

  // Static paths
  STATIC = "/",
}

/**
 * Helper function to build API paths
 * @param version API version
 * @param path API path
 * @returns Full API path
 */
export function buildApiPath(version: string, path: string): string {
  return `${ApiPath.BASE}/${version}${path}`;
}
