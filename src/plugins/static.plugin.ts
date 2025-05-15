import type { FastifyPluginAsync } from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyPlugin from "fastify-plugin"
import path from "path"
import { ApiPath } from "../constants/api-path.enum"

const staticPlugin: FastifyPluginAsync = async (fastify) => {
  // Register the static plugin
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "..", "public"),
    prefix: ApiPath.STATIC,
  })

  // Serve index.html for the root route
  fastify.get(ApiPath.STATIC, (request, reply) => {
    return reply.sendFile(ApiPath.INDEX.substring(1)) // Remove leading slash
  })
}

export default fastifyPlugin(staticPlugin)
