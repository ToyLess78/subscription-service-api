import type { FastifyPluginAsync } from "fastify"
import fastifyStatic from "@fastify/static"
import fastifyPlugin from "fastify-plugin"
import path from "path"

const staticPlugin: FastifyPluginAsync = async (fastify) => {
  // Register the static plugin
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "..", "..", "public"),
    prefix: "/",
  })

  // Serve index.html for the root route
  fastify.get("/", (request, reply) => {
    return reply.sendFile("index.html")
  })
}

export default fastifyPlugin(staticPlugin)
