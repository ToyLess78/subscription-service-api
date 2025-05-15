import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { RouteService } from "../services/route.service"

const startupPlugin: FastifyPluginAsync = async (fastify) => {
  // Register the onReady hook to log startup information
  fastify.addHook("onReady", async () => {
    try {
      // Log application startup information
      fastify.log.info(`=== Application Started ===`)
      fastify.log.info(`Environment: ${fastify.config.NODE_ENV}`)
      fastify.log.info(`Version: ${fastify.config.API_VERSION}`)
      fastify.log.info(`Server listening on ${fastify.config.HOST}:${fastify.config.PORT}`)

      // Log all registered routes
      const routeService = new RouteService(fastify)
      routeService.logAllRoutes()
    } catch (error) {
      fastify.log.error("Error during startup logging", error)
    }
  })
}

export default fastifyPlugin(startupPlugin)
