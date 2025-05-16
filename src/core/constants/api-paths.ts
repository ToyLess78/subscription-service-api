/**
 * API paths
 */
export enum ApiPath {
  // Base paths
  API = "/api",
  HEALTH = "/health",
  DOCS = "/documentation",

  // Weather paths
  WEATHER = "/weather",

  // Subscription paths
  SUBSCRIBE = "/subscribe",
  CONFIRM = "/confirm",
  UNSUBSCRIBE = "/unsubscribe",
}

/**
 * Build API path with version
 * @param version API version
 * @param path API path
 * @returns Full API path with version
 */
export function buildApiPath(version: string, path: string): string {
  return `${ApiPath.API}/${version}${path}`;
}
