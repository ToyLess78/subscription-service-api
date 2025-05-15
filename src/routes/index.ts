import type { FastifyPluginAsync } from "fastify"
import weatherRoutes from "./weather.routes"
import { ApiPath } from "../constants/api-path.enum"

// Define the health check response type
export interface HealthCheckResponse {
  status: string
  timestamp: string
  [key: string]: unknown
}

const routes: FastifyPluginAsync = async (fastify) => {
  // Health check route
  fastify.get(ApiPath.HEALTH, {
    schema: {
      tags: ["system"],
      summary: "Health check endpoint",
      description: "Returns the current status of the API",
      response: {
        200: {
          description: "API is healthy",
          type: "object",
          properties: {
            status: { type: "string" },
            timestamp: { type: "string" },
            database: {
              type: "object",
              properties: {
                connected: { type: "boolean" },
                lastConnected: { type: "string", nullable: true },
                connectionAttempts: { type: "number" },
              },
            },
          },
        },
      },
    },
    handler: async (): Promise<HealthCheckResponse> => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      }
    },
  })

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
    handler: async () => {
      return {
        name: "weather-subscription-api",
        version: fastify.config.API_VERSION,
        environment: fastify.config.NODE_ENV,
      }
    },
  })

  // Register weather routes
  await fastify.register(weatherRoutes)
}

export default routes
