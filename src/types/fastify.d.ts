import type {
  FastifyRequest as OriginalFastifyRequest,
  FastifyReply as OriginalFastifyReply,
} from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    register: (plugin: unknown, options?: unknown) => FastifyInstance;
    get: (
      path: string,
      handler: (
        request: OriginalFastifyRequest,
        reply: OriginalFastifyReply,
      ) => void,
    ) => FastifyInstance;
  }

  interface FastifyReply {
    sendFile(filename: string): FastifyReply;
    redirect(statusCode: number, url: string): FastifyReply;
  }
}
