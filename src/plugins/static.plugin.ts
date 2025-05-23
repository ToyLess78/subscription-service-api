import fastifyStatic from "@fastify/static";
import fastifyPlugin from "fastify-plugin";
import path from "path";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

// Use a regular function with proper type annotations
async function staticPlugin(fastify: FastifyInstance): Promise<void> {
  // Register the static plugin with decorateReply set to true
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "..", "public"),
    prefix: "/",
    decorateReply: true,
  });

  // Serve index.html for the root route
  fastify.get(
    "/",
    (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      return reply.sendFile("index.html") as unknown as Promise<void>;
    },
  );

  // Setup redirection from /confirm/:token to confirmation.html with token as query param
  fastify.get(`/confirm/:token`, {
    schema: {
      hide: true,
    },
    handler: (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      // Type assertion for params
      const params = request.params as { token: string };
      const token = params.token;
      return reply.redirect(
        302,
        `/confirmation.html?token=${token}`,
      ) as unknown as Promise<void>;
    },
  });

  // Setup redirection from /unsubscribe/:token to unsubscribed.html with token as query param
  fastify.get(`/unsubscribe/:token`, {
    schema: {
      hide: true,
    },
    handler: (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      // Type assertion for params
      const params = request.params as { token: string };
      const token = params.token;
      return reply.redirect(
        302,
        `/unsubscribed.html?token=${token}`,
      ) as unknown as Promise<void>;
    },
  });
}

export default fastifyPlugin(staticPlugin);
