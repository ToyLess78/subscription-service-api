import Fastify from "fastify"
import dotenv from "dotenv"

// Load environment variables from .env file
dotenv.config()

// Import plugins
import config from "./utils/config"
import db from "./db"
import routes from "./routes"
import staticPlugin from "./plugins/static"
import swaggerPlugin from "./plugins/swagger"

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
  },
})

// Register plugins
const start = async () => {
  try {
    // Register configuration plugin
    await fastify.register(config)

    // Register database plugin
    await fastify.register(db)

    // Register Swagger plugin
    await fastify.register(swaggerPlugin)

    // Register static files plugin
    await fastify.register(staticPlugin)

    // Register API routes
    await fastify.register(routes, { prefix: `/api/${fastify.config.API_VERSION}` })

    // Start the server
    await fastify.listen({
      port: Number.parseInt(fastify.config.PORT, 10),
      host: fastify.config.HOST,
    })

    console.log(`Server is running on ${fastify.config.HOST}:${fastify.config.PORT}`)
    console.log(`API documentation available at http://${fastify.config.HOST}:${fastify.config.PORT}/documentation`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err)
  process.exit(1)
})

// Start the server
start()
