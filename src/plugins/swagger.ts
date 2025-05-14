import type { FastifyPluginAsync } from "fastify"
import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import fastifyPlugin from "fastify-plugin"

const swaggerPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifySwagger, {
    swagger: {
      info: {
        title: "Weather Subscription API",
        description: "API for retrieving weather data and managing subscriptions",
        version: "1.0.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      host: `${fastify.config.HOST}:${fastify.config.PORT}`,
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "weather", description: "Weather related endpoints" },
        { name: "system", description: "System related endpoints" },
      ],
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: (request, reply, next) => {
        next()
      },
      preHandler: (request, reply, next) => {
        next()
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })
}

export default fastifyPlugin(swaggerPlugin)
