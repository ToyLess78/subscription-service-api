import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"
import { AppError, InternalServerError } from "../utils/errors"
import { formatError } from "../utils/logger.utils"

const errorMiddleware: FastifyPluginAsync = async (fastify) => {
  // Add a custom error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    const isDev = fastify.config.NODE_ENV === "development"

    // Handle AppError instances
    if (error instanceof AppError) {
      fastify.log.error({
        msg: `[${error.name}] ${error.message}`,
        statusCode: error.statusCode,
        operationalError: error.isOperational,
        ...(isDev && { stack: error.stack }),
      })

      return reply.status(error.statusCode).send({
        error: error.message,
      })
    }

    // Handle validation errors from Fastify
    if (error.validation) {
      const validationError = {
        msg: "Validation Error",
        details: error.validation,
      }

      fastify.log.error(validationError)

      return reply.status(400).send({
        error: "Validation Error",
        details: error.validation,
      })
    }

    // Handle other errors
    const serverError = new InternalServerError("An unexpected error occurred")

    fastify.log.error({
      msg: "Unhandled server error",
      originalError: formatError(error, isDev),
      handledAs: formatError(serverError),
    })

    return reply.status(serverError.statusCode).send({
      error: serverError.message,
    })
  })
}

export default fastifyPlugin(errorMiddleware)
