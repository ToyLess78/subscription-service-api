import type { IDatabaseClient } from "../database.interface";

/**
 * Migration to create the subscriptions table
 */
export async function up(db: IDatabaseClient): Promise<void> {
  await db.executeQuery(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      frequency VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      token VARCHAR(255) NOT NULL,
      token_expiry TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(email, city)
    )
  `);
}

/**
 * Migration to drop the subscriptions table
 */
export async function down(db: IDatabaseClient): Promise<void> {
  await db.executeQuery(`
    DROP TABLE IF EXISTS subscriptions
  `);
}
