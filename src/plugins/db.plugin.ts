import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { DatabaseService } from "../db/database.service"
import type { IDatabaseClient } from "../db/database.interface"
import { ErrorMessage } from "../constants/error-message.enum"

type DbPluginOptions = {}

// Define the health check response type
interface HealthCheckResponse {
  status: string
  timestamp: string
  [key: string]: unknown
}

const dbPlugin: FastifyPluginAsync<DbPluginOptions> = async (fastify, options) => {
  const databaseUrl = fastify.config.DATABASE_URL
  const connectionTimeout = Number.parseInt(fastify.config.DATABASE_CONNECTION_TIMEOUT, 10)

  // Create a logger adapter that uses fastify's logger
  const logger = {
    info: (msg: string) => fastify.log.info(`[Database] ${msg}`),
    error: (msg: string, err?: Error) => fastify.log.error({ err, msg: `[Database] ${msg}` }),
  }

  // Initialize the database client
  const db: IDatabaseClient = new DatabaseService(
      {
        url: databaseUrl,
        connectionTimeout,
      },
      logger,
  )

  // Make the db client available through the fastify instance
  fastify.decorate("db", db)

  // Try to connect to the database
  try {
    if (databaseUrl) {
      await db.connect()
    } else {
      fastify.log.warn(ErrorMessage.DATABASE_URL_MISSING)
    }
  } catch (error) {
    // Log the error but don't crash the server
    fastify.log.error(error)
  }

  // Close the connection when the fastify instance is closed
  fastify.addHook("onClose", async (instance) => {
    try {
      await instance.db.disconnect()
    } catch (error) {
      fastify.log.error(error)
    }
  })

  // Add a health check route that includes database status
  fastify.addHook("onRoute", (routeOptions) => {
    if (routeOptions.url === "/api/v1/health" && routeOptions.method === "GET") {
      // Fix: Store the original handler
      const originalHandler = routeOptions.handler

      // Replace the handler with one that includes database status
      // Fix: Use a proper function to maintain 'this' context
      routeOptions.handler = async function (request, reply) {
        // Fix: Call the original handler with the correct context and cast the result
        const originalResponse = (await originalHandler.call(this, request, reply)) as HealthCheckResponse
        const dbStatus = db.getStatus()

        // Fix: Create a new response object with proper typing
        return {
          status: originalResponse?.status || "ok",
          timestamp: originalResponse?.timestamp || new Date().toISOString(),
          database: {
            connected: db.isConnected(),
            lastConnected: dbStatus.lastConnected,
            connectionAttempts: dbStatus.connectionAttempts,
          },
        }
      }
    }
  })
}

export default fastifyPlugin(dbPlugin)

// Type declaration for the fastify instance with db
declare module "fastify" {
  interface FastifyInstance {
    db: IDatabaseClient
  }
}
