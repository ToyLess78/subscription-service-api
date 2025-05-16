import { PinoLoggerService } from "./pino-logger.service";
import { env } from "../../config/environment";
import type pino from "pino";

// Configure logger options
const loggerOptions: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  transport:
    env.PRETTY_LOGS === "true"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  redact: {
    paths: [
      "password",
      "passwordConfirmation",
      "email",
      "token",
      "*.password",
      "*.token",
      "*.key",
    ],
    remove: true,
  },
};

// Create and export the logger instance
export const logger = new PinoLoggerService(loggerOptions);
