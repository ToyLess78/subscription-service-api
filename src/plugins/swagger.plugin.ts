import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { ApiPath } from "../constants/api-path.enum";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

const swaggerPlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
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
          // Only expose Weather and Subscription schemas
          // The actual schema definitions are registered via the schemas plugin
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
      onRequest: (
        _request: FastifyRequest,
        _reply: FastifyReply,
        next: (err?: Error) => void,
      ): void => {
        next();
      },
      preHandler: (
        _request: FastifyRequest,
        _reply: FastifyReply,
        next: (err?: Error) => void,
      ): void => {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header: string): string => header,
  });

  // Add a redirect from /api to the documentation but hide it from Swagger docs
  fastify.get("/api", {
    schema: {
      hide: true,
    },
    handler: (_request, reply): Promise<void> => {
      return reply.redirect(
        302,
        ApiPath.DOCUMENTATION,
      ) as unknown as Promise<void>;
    },
  });
};

export default fastifyPlugin(swaggerPlugin);
