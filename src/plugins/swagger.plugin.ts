import type { FastifyPluginAsync } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyPlugin from "fastify-plugin";
import { ApiPath } from "../constants/api-path.enum";
import {
  subscriptionSchema,
  createSubscriptionSchema,
  subscriptionResponseSchema,
} from "../models/subscription.schema";
import { weatherSchema, weatherRequestSchema } from "../models/weather.schema";

const swaggerPlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  // @ts-ignore
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Weather Subscription API",
        description:
          "API for retrieving weather data and managing subscriptions",
        version: "1.0.0",
      },
      externalDocs: {
        url: "https://swagger.io",
        description: "Find more info here",
      },
      servers:
        process.env.NODE_ENV === "development"
          ? [
              {
                url: `http://${fastify.config.HOST}:${fastify.config.PORT}`,
                description: "Dev server",
              },
            ]
          : [],
      tags: [
        { name: "weather", description: "Weather related endpoints" },
        { name: "subscription", description: "Subscription related endpoints" },
        { name: "system", description: "System related endpoints" },
      ],
      components: {
        schemas: {
          // Register schemas for Swagger documentation
          Subscription: subscriptionSchema,
          CreateSubscription: createSubscriptionSchema,
          SubscriptionResponse: subscriptionResponseSchema,
          Weather: weatherSchema,
          WeatherRequest: weatherRequestSchema,
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: ApiPath.DOCUMENTATION,
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
      displayRequestDuration: true,
      filter: true,
    },
    uiHooks: {
      onRequest: (_request, _reply, next): void => {
        next();
      },
      preHandler: (_request, _reply, next): void => {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header): string => header,
  });

  // Add a redirect from /api to the documentation
  fastify.get("/api", (_request, reply): Promise<void> => {
    return reply.redirect(
      302,
      ApiPath.DOCUMENTATION,
    ) as unknown as Promise<void>;
  });
};

export default fastifyPlugin(swaggerPlugin);
