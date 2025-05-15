import Fastify from "fastify"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Import plugins and middleware
import config from "./config"
import dbPlugin from "./plugins/db.plugin"
import schemasPlugin from "./plugins/schemas.plugin"
import swaggerPlugin from "./plugins/swagger.plugin"
import staticPlugin from "./plugins/static.plugin"
import loggerPlugin from "./plugins/logger.plugin"
import startupPlugin from "./plugins/startup.plugin"
import errorMiddleware from "./middlewares/error.middleware"
import routes from "./routes"
import { buildApiPath } from "./constants/api-path.enum"

// Create Fastify instance with logger configuration
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        colorize: true,
      },
    },
  },
  disableRequestLogging: true, // We'll handle request logging in our logger plugin
})

// Register plugins
const start = async () => {
  try {
    // Register configuration plugin
    await fastify.register(config)

    // Register custom logger plugin
    await fastify.register(loggerPlugin, {
      prettyPrint: fastify.config.NODE_ENV === "development",
      redactPaths: ["req.headers.authorization", "req.headers.cookie"],
    })

    // Register error handling middleware
    await fastify.register(errorMiddleware)

    // Register database plugin
    await fastify.register(dbPlugin)

    // Register schemas plugin (must be before swagger and routes)
    await fastify.register(schemasPlugin)

    // Register Swagger plugin (must be before routes)
    await fastify.register(swaggerPlugin)

    // Register static files plugin
    await fastify.register(staticPlugin)

    // Register API routes with dynamic prefix based on config
    await fastify.register(routes, {
      prefix: buildApiPath(fastify.config.API_VERSION, ""),
    })

    // Register startup plugin (must be after routes)
    await fastify.register(startupPlugin)

    // Start the server
    await fastify.listen({
      port: Number.parseInt(fastify.config.PORT, 10),
      host: fastify.config.HOST,
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  fastify.log.error("Unhandled rejection:", err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err)
  process.exit(1)
})

// Start the server
start()
