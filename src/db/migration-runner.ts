import type { IDatabaseClient } from "./database.interface";
import * as createSubscriptionsTable from "./migrations/001_create_subscriptions_table";

/**
 * Interface for a migration
 */
interface Migration {
  up: (db: IDatabaseClient) => Promise<void>;
  down: (db: IDatabaseClient) => Promise<void>;
}

/**
 * Migration runner to manage database migrations
 */
export class MigrationRunner {
  private db: IDatabaseClient;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(
    db: IDatabaseClient,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.db = db;
    this.logger = logger;
  }

  /**
   * Run all migrations
   */
  async runMigrations(): Promise<void> {
    this.logger.info("Running migrations...");

    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();

      // Get all migrations
      const migrations: Record<string, Migration> = {
        "001_create_subscriptions_table": createSubscriptionsTable,
      };

      // Run migrations that haven't been applied yet
      for (const [name, migration] of Object.entries(migrations)) {
        if (!appliedMigrations.includes(name)) {
          this.logger.info(`Applying migration: ${name}`);
          await migration.up(this.db);
          await this.recordMigration(name);
          this.logger.info(`Migration applied: ${name}`);
        } else {
          this.logger.info(`Migration already applied: ${name}`);
        }
      }

      this.logger.info("Migrations completed successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Migration failed", err);
      throw err;
    }
  }

  /**
   * Create migrations table if it doesn't exist
   */
  private async createMigrationsTable(): Promise<void> {
    await this.db.executeQuery(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  }

  /**
   * Get list of applied migrations
   */
  private async getAppliedMigrations(): Promise<string[]> {
    const result = await this.db.executeQuery<{ name: string }>(`
      SELECT name FROM migrations ORDER BY id ASC
    `);
    return result.map((row) => row.name);
  }

  /**
   * Record a migration as applied
   */
  private async recordMigration(name: string): Promise<void> {
    await this.db.executeQuery(
      `
      INSERT INTO migrations (name) VALUES ($1)
    `,
      [name],
    );
  }
}
