import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { ApiPath } from "../core/constants";
import fastifySwagger, { type SwaggerOptions } from "@fastify/swagger";
import fastifySwaggerUi, {
  type FastifySwaggerUiOptions,
} from "@fastify/swagger-ui";
const swaggerPlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Weather Subscription API",
        description:
          "Weather API application that allows users to subscribe to weather updates for their city.",
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
        { name: "weather", description: "Weather forecast operations" },
        {
          name: "subscription",
          description: "Subscription management operations",
        },
        { name: "system", description: "System related endpoints" },
      ],
      components: {
        schemas: {},
      },
    },
  } as SwaggerOptions);

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
  } as FastifySwaggerUiOptions);

  // Add a redirect from /api to the documentation but hide it from Swagger docs
  fastify.get("/api", {
    schema: {
      hide: true,
    },
    handler: async (
      _request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> => {
      void reply.redirect(302, ApiPath.DOCUMENTATION);
    },
  });
};

export default fastifyPlugin(swaggerPlugin);
