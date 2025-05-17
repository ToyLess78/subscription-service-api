import type { FastifyPluginAsync } from "fastify";
import weatherRoutes from "./weather.routes";
import subscriptionRoutes from "./subscription.routes";
import { ApiPath } from "../constants/api-path.enum";
import cronRoutes from "./cron.routes";
import { healthCheckResponseSchema } from "../schemas";

// Define the health check response type
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  [key: string]: unknown;
}

const routes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Health check route
  fastify.get(ApiPath.HEALTH, {
    schema: {
      tags: ["system"],
      summary: "Health check endpoint",
      description: "Returns the current status of the API",
      response: {
        200: healthCheckResponseSchema,
      },
    },
    handler: async (): Promise<HealthCheckResponse> => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
  });

  // API version route
  fastify.get(ApiPath.STATIC, {
    schema: {
      tags: ["system"],
      summary: "API information",
      description: "Returns basic information about the API",
      response: {
        200: {
          description: "API information",
          type: "object",
          properties: {
            name: { type: "string" },
            version: { type: "string" },
            environment: { type: "string" },
          },
        },
      },
    },
    handler: async (): Promise<{
      name: string;
      version: string;
      environment: string;
    }> => {
      return {
        name: "weather-subscription-api",
        version: fastify.config.API_VERSION,
        environment: fastify.config.NODE_ENV,
      };
    },
  });

  // Register weather routes
  await fastify.register(weatherRoutes);

  // Register subscription routes
  await fastify.register(subscriptionRoutes);

  // Register cron routes
  await fastify.register(cronRoutes);
};

export default routes;
