import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID } from "crypto";
import {
  redactSensitiveInfo,
  type RecordWithNestedValues,
} from "../utils/logger.utils";

interface LoggerOptions {
  prettyPrint: boolean;
  redactPaths?: string[];
}

// Define the serializer types
interface LogSerializers {
  [key: string]: ((value: unknown) => Record<string, unknown>) | undefined;
}

// Extend the FastifyBaseLogger interface to include serializers
declare module "fastify" {
  interface FastifyBaseLogger {
    serializers?: LogSerializers;
  }
}

const loggerPlugin: FastifyPluginAsync<LoggerOptions> = async (
  fastify,
  options,
): Promise<void> => {
  const { prettyPrint = true, redactPaths = ["req.headers.authorization"] } =
    options;

  // Configure logger
  if (prettyPrint && fastify.log.level !== "error") {
    // Override the default logger serializers for prettier output
    fastify.log.serializers = {
      req: (value: unknown): Record<string, unknown> => {
        const request = value as FastifyRequest;
        const reqInfo: RecordWithNestedValues = {
          method: request.method,
          url: request.url,
          hostname: request.hostname,
          remoteAddress: request.ip,
          remotePort: request.socket.remotePort,
        };

        // Redact sensitive information
        return redactSensitiveInfo(reqInfo, redactPaths);
      },
      res: (value: unknown): Record<string, unknown> => {
        const reply = value as FastifyReply;
        return {
          statusCode: reply.statusCode,
        };
      },
    };
  }

  // Add request ID to each request
  fastify.addHook("onRequest", (request, _reply, done): void => {
    request.id = request.id || randomUUID();
    done();
  });

  // Log request start
  fastify.addHook("onRequest", (request, _reply, done): void => {
    request.log.info({
      msg: "Request received",
      reqId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    });
    done();
  });

  // Log request completion with timing
  fastify.addHook("onResponse", (request, reply, done): void => {
    const responseTime = reply.getResponseTime();
    request.log.info({
      msg: "Request completed",
      reqId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: `${responseTime.toFixed(2)}ms`,
    });
    done();
  });

  // Log errors
  fastify.addHook("onError", (request, reply, error, done): void => {
    request.log.error({
      msg: "Request error",
      reqId: request.id,
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      error: error.message,
      stack:
        fastify.config.NODE_ENV === "development" ? error.stack : undefined,
    });
    done();
  });

  // Create a utility to log all registered routes
  fastify.decorate("logRoutes", (): void => {
    const routes = fastify.printRoutes();
    fastify.log.info("=== Registered Routes ===\n" + routes);
  });
};

export default fastifyPlugin(loggerPlugin);

// Type declaration for the fastify instance with logRoutes
declare module "fastify" {
  interface FastifyInstance {
    logRoutes: () => void;
  }
}
