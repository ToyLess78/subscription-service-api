import type { FastifyPluginAsync } from "fastify";
import { errorResponseSchema, successResponseSchema } from "../schemas";

const cronRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // POST /api/v1/cron/trigger/:id endpoint
  fastify.post(`/cron/trigger/:id`, {
    schema: {
      tags: ["system"],
      summary: "Manually trigger a cron job",
      description:
        "Manually triggers a cron job for a specific subscription (for testing)",
      params: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Subscription ID",
          },
        },
        required: ["id"],
      },
      response: {
        200: successResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await fastify.cron.forceRunJob(id);
        return reply.code(200).send({
          message: `Job for subscription ${id} triggered successfully`,
        });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        fastify.log.error(`Failed to trigger job for subscription ${id}`, err);
        return reply.code(500).send({
          error: `Failed to trigger job: ${err.message}`,
        });
      }
    },
  });
};

export default cronRoutes;
