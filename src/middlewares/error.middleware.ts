import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { AppError, InternalServerError } from "../utils/errors";
import { formatError } from "../utils/logger.utils";
import { ErrorMessage } from "../constants/error-message.enum";
import { HttpStatus } from "../constants/http-status.enum";

const errorMiddleware: FastifyPluginAsync = async (fastify) => {
  // Add a custom error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    const isDev = fastify.config.NODE_ENV === "development";

    // Handle AppError instances
    if (error instanceof AppError) {
      fastify.log.error({
        msg: `[${error.name}] ${error.message}`,
        statusCode: error.statusCode,
        operationalError: error.isOperational,
        ...(isDev && { stack: error.stack }),
      });

      return reply.status(error.statusCode).send({
        error: error.message,
      });
    }

    // Handle validation errors from Fastify
    if ("validation" in error && error.validation) {
      const validationError = {
        msg: ErrorMessage.VALIDATION_ERROR,
        details: error.validation,
      };

      fastify.log.error(validationError);

      return reply.status(HttpStatus.BAD_REQUEST).send({
        error: ErrorMessage.VALIDATION_ERROR,
        details: error.validation,
      });
    }

    // Handle other errors
    const serverError = new InternalServerError();

    fastify.log.error({
      msg: "Unhandled server error",
      originalError: formatError(
        error instanceof Error ? error : new Error(String(error)),
        isDev,
      ),
      handledAs: formatError(serverError),
    });

    return reply.status(serverError.statusCode).send({
      error: serverError.message,
    });
  });
};

export default fastifyPlugin(errorMiddleware);
