import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
  weatherSchema,
  subscriptionSchema,
  errorResponseSchema,
} from "../schemas";

const schemasPlugin: FastifyPluginAsync = async (fastify) => {
  // Register schemas
  fastify.addSchema(weatherSchema);
  fastify.addSchema(subscriptionSchema);
  fastify.addSchema(errorResponseSchema);
};

export default fastifyPlugin(schemasPlugin);
