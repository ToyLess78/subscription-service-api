/**
 * Interface for database connection status
 */
export interface DatabaseConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  connectionAttempts: number;
}

/**
 * Interface for database connection options
 */
export interface DatabaseConnectionOptions {
  url: string;
  connectionTimeout?: number;
}

/**
 * Interface for database client
 */
export interface IDatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getStatus(): DatabaseConnectionStatus;
  executeQuery<T>(query: string, params?: unknown[]): Promise<T[]>;
}
