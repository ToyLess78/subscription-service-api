import type { FastifyPluginAsync } from "fastify"
import weatherRoutes from "./weather"

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check route
  fastify.get("/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() }
  })

  // API version route
  fastify.get("/", async () => {
    return {
      name: "weather-subscription-api",
      version: fastify.config.API_VERSION,
      environment: fastify.config.NODE_ENV,
    }
  })

  // Register weather routes
  await fastify.register(weatherRoutes)

  // Add more routes here
}

export default routes
