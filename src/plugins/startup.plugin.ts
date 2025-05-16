import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { RouteService } from "../services/route.service";

const startupPlugin: FastifyPluginAsync = async (fastify) => {
  // Register the onReady hook to log startup information
  fastify.addHook("onReady", async () => {
    try {
      // Log application startup information
      fastify.log.info(`=== Application Started ===`);
      fastify.log.info(`Environment: ${fastify.config.NODE_ENV}`);
      fastify.log.info(`Version: ${fastify.config.API_VERSION}`);
      fastify.log.info(
        `Server listening on ${fastify.config.HOST}:${fastify.config.PORT}`,
      );

      // Log database status
      const dbStatus = fastify.db.getStatus();
      fastify.log.info(
        `Database status: ${fastify.db.isConnected() ? "Connected" : "Disconnected"}`,
      );
      if (dbStatus.lastConnected) {
        fastify.log.info(
          `Last connected at: ${dbStatus.lastConnected.toISOString()}`,
        );
      }
      fastify.log.info(`Connection attempts: ${dbStatus.connectionAttempts}`);

      // Log all registered routes
      const routeService = new RouteService(fastify);
      routeService.logAllRoutes();
    } catch (error) {
      fastify.log.error("Error during startup logging", error);
    }
  });
};

export default fastifyPlugin(startupPlugin);
