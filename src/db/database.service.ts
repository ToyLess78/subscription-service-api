import type {
  IDatabaseClient,
  DatabaseConnectionStatus,
  DatabaseConnectionOptions,
} from "./database.interface";
import { DatabaseError } from "../utils/errors";
import { ErrorMessage } from "../constants/error-message.enum";

/**
 * In-memory storage for simulating a database
 */
interface InMemoryDatabase {
  migrations: Array<{ name: string; applied_at: Date }>;
  subscriptions: Array<Record<string, unknown>>;
}

/**
 * Base database service class
 * This implementation simulates a database with in-memory storage
 */
export class DatabaseService implements IDatabaseClient {
  private url: string;
  private connectionTimeout: number;
  private status: DatabaseConnectionStatus;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };
  private db: InMemoryDatabase;

  constructor(
    options: DatabaseConnectionOptions,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.url = options.url;
    this.connectionTimeout = options.connectionTimeout || 5000;
    this.logger = logger;
    this.status = {
      isConnected: false,
      lastConnected: null,
      connectionAttempts: 0,
    };
    // Initialize in-memory database
    this.db = {
      migrations: [],
      subscriptions: [],
    };
  }

  /**
   * Connect to the database
   * @throws {DatabaseError} If connection fails
   */
  async connect(): Promise<void> {
    if (this.status.isConnected) {
      this.logger.info("Database is already connected");
      return;
    }

    if (!this.url) {
      throw new DatabaseError(ErrorMessage.DATABASE_URL_MISSING);
    }

    try {
      this.status.connectionAttempts++;
      this.logger.info(
        `Connecting to database (attempt ${this.status.connectionAttempts})...`,
      );

      // Simulate connection with timeout
      await this.simulateConnection();

      this.status.isConnected = true;
      this.status.lastConnected = new Date();
      this.logger.info("Database connected successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Database connection failed", err);
      throw new DatabaseError(ErrorMessage.DATABASE_CONNECTION_ERROR, {
        cause: err,
      });
    }
  }

  /**
   * Disconnect from the database
   * @throws {DatabaseError} If disconnection fails
   */
  async disconnect(): Promise<void> {
    if (!this.status.isConnected) {
      this.logger.info("Database is not connected");
      return;
    }

    try {
      this.logger.info("Disconnecting from database...");

      // Simulate disconnection
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      this.status.isConnected = false;
      this.logger.info("Database disconnected successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Database disconnection failed", err);
      throw new DatabaseError(ErrorMessage.DATABASE_DISCONNECTION_ERROR, {
        cause: err,
      });
    }
  }

  /**
   * Check if the database is connected
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected(): boolean {
    return this.status.isConnected;
  }

  /**
   * Get the database connection status
   * @returns {DatabaseConnectionStatus} The connection status
   */
  getStatus(): DatabaseConnectionStatus {
    return { ...this.status };
  }

  /**
   * Execute a query on the database
   * @param query The SQL query to execute
   * @param params The parameters for the query
   * @returns The query results
   * @throws {DatabaseError} If the query fails
   */
  async executeQuery<T>(query: string, params: unknown[] = []): Promise<T[]> {
    if (!this.status.isConnected) {
      throw new DatabaseError(ErrorMessage.DATABASE_NOT_CONNECTED);
    }

    try {
      this.logger.info(`Executing query: ${query}`);

      // Log parameters for debugging
      if (params.length > 0) {
        this.logger.info(`Query parameters: ${JSON.stringify(params)}`);
      }

      // Simulate query execution delay
      await new Promise<void>((resolve) => setTimeout(resolve, 100));

      // Handle different types of queries
      if (query.trim().toUpperCase().startsWith("CREATE TABLE")) {
        // Handle CREATE TABLE queries
        return [] as T[];
      } else if (
        query.trim().toUpperCase().startsWith("INSERT INTO migrations")
      ) {
        // Handle migration inserts
        const name = params[0] as string;
        this.db.migrations.push({
          name,
          applied_at: new Date(),
        });
        return [] as T[];
      } else if (
        query.trim().toUpperCase().startsWith("SELECT name FROM migrations")
      ) {
        // Handle migration selects
        return this.db.migrations.map((m) => ({
          name: m.name,
        })) as unknown as T[];
      } else if (
        query.trim().toUpperCase().startsWith("INSERT INTO subscriptions")
      ) {
        // Handle subscription inserts
        const [email, city, frequency, status, token, tokenExpiry] = params;

        // Check if subscription already exists
        const existingIndex = this.db.subscriptions.findIndex(
          (s) =>
            String(s.email).toLowerCase() === String(email).toLowerCase() &&
            String(s.city).toLowerCase() === String(city).toLowerCase(),
        );

        if (existingIndex !== -1) {
          // Return empty array to simulate unique constraint violation
          return [] as T[];
        }

        const id = this.generateUuid();
        const now = new Date();

        const subscription = {
          id,
          email,
          city,
          frequency,
          status,
          token,
          token_expiry: tokenExpiry,
          created_at: now,
          updated_at: now,
        };

        this.db.subscriptions.push(subscription);

        // Log the created subscription
        this.logger.info(
          `Created subscription: ${JSON.stringify(subscription)}`,
        );

        return [subscription] as unknown as T[];
      } else if (
        query.trim().toUpperCase().startsWith("SELECT") &&
        query.includes("FROM subscriptions")
      ) {
        // Handle subscription selects
        if (query.includes("WHERE email =") && query.includes("AND city =")) {
          // Find by email and city
          const email = params[0];
          const city = params[1];

          const subscription = this.db.subscriptions.find(
            (s) =>
              String(s.email).toLowerCase() === String(email).toLowerCase() &&
              String(s.city).toLowerCase() === String(city).toLowerCase(),
          );

          return subscription
            ? ([subscription] as unknown as T[])
            : ([] as T[]);
        } else if (query.includes("WHERE token =")) {
          // Find by token
          const token = params[0];

          const subscription = this.db.subscriptions.find(
            (s) => s.token === token,
          );

          return subscription
            ? ([subscription] as unknown as T[])
            : ([] as T[]);
        }
      } else if (
        query.trim().toUpperCase().startsWith("UPDATE subscriptions")
      ) {
        // Handle subscription updates
        const id = params[params.length - 1];

        const subscriptionIndex = this.db.subscriptions.findIndex(
          (s) => s.id === id,
        );

        if (subscriptionIndex === -1) {
          return [] as T[];
        }

        const subscription = { ...this.db.subscriptions[subscriptionIndex] };

        // Update fields based on the query
        if (query.includes("status =")) {
          const statusIndex = params.indexOf(
            params.find(
              (p) =>
                typeof p === "string" &&
                ["pending", "confirmed", "unsubscribed"].includes(p as string),
            ),
          );

          if (statusIndex !== -1) {
            subscription.status = params[statusIndex];
          }
        }

        if (query.includes("token =")) {
          const tokenIndex = params.indexOf(
            params.find(
              (p) =>
                typeof p === "string" && p !== id && p !== subscription.status,
            ),
          );

          if (tokenIndex !== -1) {
            subscription.token = params[tokenIndex];
          }
        }

        if (query.includes("token_expiry =")) {
          const tokenExpiryIndex = params.indexOf(
            params.find((p) => p instanceof Date),
          );

          if (tokenExpiryIndex !== -1) {
            subscription.token_expiry = params[tokenExpiryIndex];
          }
        }

        subscription.updated_at = new Date();

        this.db.subscriptions[subscriptionIndex] = subscription;

        // Log the updated subscription
        this.logger.info(
          `Updated subscription: ${JSON.stringify(subscription)}`,
        );

        return [subscription] as unknown as T[];
      }

      // Default: return empty array
      return [] as T[];
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Query execution failed", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Simulate a database connection
   * This is a placeholder for a real database connection
   * @throws {Error} If connection times out or fails
   */
  private async simulateConnection(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Simulate connection delay
      const connectionTimer = setTimeout(() => {
        clearTimeout(timeoutTimer);
        resolve();
      }, 500);

      // Set connection timeout
      const timeoutTimer = setTimeout(() => {
        clearTimeout(connectionTimer);
        reject(new Error(ErrorMessage.DATABASE_CONNECTION_TIMEOUT));
      }, this.connectionTimeout);
    });
  }

  /**
   * Generate a UUID v4
   * @returns UUID string
   */
  private generateUuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
