import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { temperatureSchema, weatherSchema, errorResponseSchema } from "../models/weather"

const schemasPlugin: FastifyPluginAsync = async (fastify) => {
  // Register schemas
  fastify.addSchema(temperatureSchema)
  fastify.addSchema(weatherSchema)
  fastify.addSchema(errorResponseSchema)
}

export default fastifyPlugin(schemasPlugin)
