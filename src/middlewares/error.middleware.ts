import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { AppError, InternalServerError } from "../utils/errors"

const errorMiddleware: FastifyPluginAsync = async (fastify) => {
  // Add a custom error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error)

    // Handle AppError instances
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.message,
      })
    }

    // Handle validation errors from Fastify
    if (error.validation) {
      return reply.status(400).send({
        error: "Validation Error",
        details: error.validation,
      })
    }

    // Handle other errors
    const serverError = new InternalServerError("An unexpected error occurred")
    return reply.status(serverError.statusCode).send({
      error: serverError.message,
    })
  })
}

export default fastifyPlugin(errorMiddleware)
