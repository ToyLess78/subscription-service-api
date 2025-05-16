import type {
  IDatabaseClient,
  DatabaseConnectionStatus,
} from "./database.interface";
import { DatabaseError } from "../utils/errors";
import { ErrorMessage } from "../constants/error-message.enum";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { PrismaClient } from "@prisma/client";

// Define event types for Prisma
export interface PrismaQueryEvent {
  query: string;
  params: string;
  duration: number;
  target: string;
}

export interface PrismaErrorEvent {
  message: string;
  target?: string;
}

export interface PrismaInfoEvent {
  message: string;
  target?: string;
}

export interface PrismaWarnEvent {
  message: string;
  target?: string;
}

// Define a more specific type for PrismaClient that includes our custom types
export type PrismaClientType = PrismaClient & {
  subscription: {
    create: (args: {
      data: SubscriptionCreateInput;
    }) => Promise<SubscriptionModel>;
    findUnique: (args: {
      where: Record<string, unknown>;
    }) => Promise<SubscriptionModel | null>;
    findMany: (args: {
      where?: Record<string, unknown>;
    }) => Promise<SubscriptionModel[]>;
    update: (args: {
      where: Record<string, unknown>;
      data: SubscriptionUpdateInput;
    }) => Promise<SubscriptionModel>;
  };
  $on<T extends "query" | "error" | "info" | "warn">(
    eventType: T,
    callback: T extends "query"
      ? (event: PrismaQueryEvent) => void
      : T extends "error"
        ? (event: PrismaErrorEvent) => void
        : T extends "info"
          ? (event: PrismaInfoEvent) => void
          : (event: PrismaWarnEvent) => void,
  ): void;
};

// Define custom types for Subscription model
export interface SubscriptionModel {
  id: string;
  email: string;
  city: string;
  frequency: string;
  status: string;
  token: string;
  tokenExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSentAt: Date | null;
  nextScheduledAt: Date | null;
}

// Define input types for Subscription operations
export type SubscriptionCreateInput = Omit<
  SubscriptionModel,
  "id" | "createdAt" | "updatedAt"
> & {
  lastSentAt?: Date | null;
  nextScheduledAt?: Date | null;
};

export type SubscriptionUpdateInput = Partial<SubscriptionModel>;

/**
 * Prisma database service
 */
export class PrismaService implements IDatabaseClient {
  private prisma: PrismaClientType;
  private status: DatabaseConnectionStatus;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  }) {
    this.logger = logger;

    // Check if Prisma client is generated
    this.ensurePrismaClientGenerated();

    // Initialize Prisma client
    try {
      // Import PrismaClient dynamically
      const { PrismaClient } = require("@prisma/client") as {
        PrismaClient: new (options: unknown) => PrismaClientType;
      };
      this.prisma = new PrismaClient({
        log: [
          { level: "query", emit: "event" },
          { level: "error", emit: "event" },
          { level: "info", emit: "event" },
          { level: "warn", emit: "event" },
        ],
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to initialize Prisma client", err);
      throw new Error(`Failed to initialize Prisma client: ${err.message}`);
    }

    this.status = {
      isConnected: false,
      lastConnected: null,
      connectionAttempts: 0,
    };

    // Set up Prisma logging
    this.setupLogging();
  }

  /**
   * Ensure Prisma client is generated
   * @throws {Error} If Prisma client is not generated
   */
  private ensurePrismaClientGenerated(): void {
    try {
      // Check if prisma directory exists
      const prismaDir = path.resolve(process.cwd(), "prisma");
      if (!fs.existsSync(prismaDir)) {
        this.logger.info("Creating prisma directory...");
        fs.mkdirSync(prismaDir, { recursive: true });
      }

      // Check if schema.prisma exists
      const schemaPath = path.resolve(prismaDir, "schema.prisma");
      if (!fs.existsSync(schemaPath)) {
        this.logger.info("Creating schema.prisma file...");
        const schemaContent = `
          generator client {
            provider = "prisma-client-js"
          }
          
          datasource db {
            provider = "postgresql"
            url      = env("DATABASE_URL")
          }
          
          model Subscription {
            id           String   @id @default(uuid())
            email        String
            city         String
            frequency    String
            status       String   @default("pending")
            token        String   @unique
            token_expiry DateTime
            created_at   DateTime @default(now())
            updated_at   DateTime @updatedAt
            last_sent_at DateTime?
            next_scheduled_at DateTime?
            
            @@unique([email, city])
          }
        `;
        fs.writeFileSync(schemaPath, schemaContent.trim());
      }

      // Try to require the Prisma client
      try {
        // Import PrismaClient dynamically
        require("@prisma/client");
      } catch (error) {
        // If the error is about missing the Prisma client, generate it
        if (
          error instanceof Error &&
          error.message.includes("Cannot find module")
        ) {
          this.logger.info("Prisma client not found. Generating...");
          try {
            // Generate the Prisma client
            execSync("npx prisma generate", { stdio: "inherit" });
            this.logger.info("Prisma client generated successfully");
          } catch (genError) {
            this.logger.error(
              "Failed to generate Prisma client",
              genError instanceof Error
                ? genError
                : new Error(String(genError)),
            );
            throw new Error(
              "Failed to generate Prisma client. Please run 'npx prisma generate' manually.",
            );
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Error ensuring Prisma client is generated", err);
      throw err;
    }
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

    try {
      this.status.connectionAttempts++;
      this.logger.info(
        `Connecting to database (attempt ${this.status.connectionAttempts})...`,
      );

      // Connect to the database
      await this.prisma.$connect();

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

      // Disconnect from the database
      await this.prisma.$disconnect();

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

      // Execute the query using Prisma's $queryRawUnsafe
      const result = await this.prisma.$queryRawUnsafe<T[]>(query, ...params);
      return result;
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
   * Get the Prisma client instance
   * @returns The Prisma client instance
   */
  getPrismaClient(): PrismaClientType {
    return this.prisma;
  }

  /**
   * Run database migrations
   * This is handled by Prisma Migrate
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.info("Running Prisma migrations...");

      // Check if we're in a production environment
      const isProduction = process.env.NODE_ENV === "production";

      if (isProduction) {
        // In production, we use prisma migrate deploy
        execSync("npx prisma migrate deploy", { stdio: "inherit" });
      } else {
        // In development, we can use prisma migrate dev
        execSync("npx prisma migrate dev --name init --create-only", {
          stdio: "inherit",
        });
        execSync("npx prisma migrate deploy", { stdio: "inherit" });
      }

      this.logger.info("Prisma migrations completed successfully");
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to run Prisma migrations", err);
      throw new DatabaseError("Failed to run database migrations", {
        cause: err,
      });
    }
  }

  /**
   * Set up Prisma logging
   */
  private setupLogging(): void {
    // Log queries
    this.prisma.$on("query", (event: PrismaQueryEvent) => {
      this.logger.info(`Prisma Query: ${event.query}`);
    });

    // Log errors
    this.prisma.$on("error", (event: PrismaErrorEvent) => {
      this.logger.error(`Prisma Error: ${event.message}`);
    });

    // Log info
    this.prisma.$on("info", (event: PrismaInfoEvent) => {
      this.logger.info(`Prisma Info: ${event.message}`);
    });

    // Log warnings
    this.prisma.$on("warn", (event: PrismaWarnEvent) => {
      this.logger.info(`Prisma Warning: ${event.message}`);
    });
  }
}
