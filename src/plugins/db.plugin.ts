import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { IDatabaseClient } from "../db/database.interface";
import { exec } from "child_process";
import { promisify } from "util";
import { DatabaseFactory, DatabaseType } from "../db/database.factory";

const execAsync = promisify(exec);

type DbPluginOptions = {};

// Define the health check response type
interface HealthCheckResponse {
  status: string;
  timestamp: string;
  [key: string]: unknown;
}

const dbPlugin: FastifyPluginAsync<DbPluginOptions> = async (
  fastify,
  _options,
): Promise<void> => {
  // Create a logger adapter that uses fastify's logger
  const logger = {
    info: (msg: string): void => {
      fastify.log.info(`[Database] ${msg}`);
    },
    error: (msg: string, err?: Error): void => {
      fastify.log.error({ err, msg: `[Database] ${msg}` });
    },
  };

  // Initialize the database client
  const dbType =
    process.env.NODE_ENV === "test" ? DatabaseType.MEMORY : DatabaseType.PRISMA;
  const db: IDatabaseClient = DatabaseFactory.createDatabaseClient(
    dbType,
    logger,
  );

  // Make the db client available through the fastify instance
  fastify.decorate("db", db);

  // Try to connect to the database and run migrations
  try {
    // Connect to the database
    await db.connect();

    // Run Prisma migrations
    logger.info("Running Prisma migrations...");
    try {
      // Run Prisma migrations using the CLI
      const { stdout, stderr } = await execAsync("npx prisma migrate deploy");
      if (stdout) logger.info(stdout);
      if (stderr) logger.error(stderr);
      logger.info("Prisma migrations completed successfully");
    } catch (migrationError) {
      logger.error(
        "Failed to run Prisma migrations",
        migrationError instanceof Error
          ? migrationError
          : new Error(String(migrationError)),
      );
    }
  } catch (error) {
    // Log the error but don't crash the server
    fastify.log.error(error);
  }

  // Close the connection when the fastify instance is closed
  fastify.addHook("onClose", async (instance): Promise<void> => {
    try {
      await instance.db.disconnect();
    } catch (error) {
      fastify.log.error(error);
    }
  });

  // Add a health check route that includes database status
  fastify.addHook("onRoute", (routeOptions): void => {
    if (
      routeOptions.url === "/api/v1/health" &&
      routeOptions.method === "GET"
    ) {
      // Fix: Store the original handler
      const originalHandler = routeOptions.handler;

      // Replace the handler with one that includes database status
      // Fix: Use a proper function to maintain 'this' context
      routeOptions.handler = async function (
        request,
        reply,
      ): Promise<HealthCheckResponse> {
        // Fix: Call the original handler with the correct context and cast the result
        const originalResponse = (await originalHandler.call(
          this,
          request,
          reply,
        )) as HealthCheckResponse;
        const dbStatus = db.getStatus();

        // Fix: Create a new response object with proper typing
        return {
          status: originalResponse?.status || "ok",
          timestamp: originalResponse?.timestamp || new Date().toISOString(),
          database: {
            connected: db.isConnected(),
            lastConnected: dbStatus.lastConnected,
            connectionAttempts: dbStatus.connectionAttempts,
          },
        };
      };
    }
  });
};

export default fastifyPlugin(dbPlugin);

// Type declaration for the fastify instance with db
declare module "fastify" {
  interface FastifyInstance {
    db: IDatabaseClient;
  }
}
