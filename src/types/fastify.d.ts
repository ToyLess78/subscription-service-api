import type { FastifyRequest, FastifyReply } from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    register: (plugin: unknown, options?: unknown) => FastifyInstance;
    get: (
      path: string,
      handler: (request: FastifyRequest, reply: FastifyReply) => void,
    ) => FastifyInstance;
  }

  interface FastifyReply {
    sendFile(filename: string): FastifyReply;
    redirect(statusCode: number, url: string): FastifyReply;
  }

  // We don't need to define params here since we're using type assertions in the code
}
