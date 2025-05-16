import pino from "pino";
import type { ILogger } from "../../core/interfaces/logger.interface";

/**
 * Pino logger service implementation
 */
export class PinoLoggerService implements ILogger {
  private logger: pino.Logger;

  constructor(options?: pino.LoggerOptions) {
    this.logger = pino(options);
  }

  trace(message: string, ...args: unknown[]): void {
    this.logger.trace({ args }, message);
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug({ args }, message);
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info({ args }, message);
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn({ args }, message);
  }

  error(message: string, error?: Error, ...args: unknown[]): void {
    this.logger.error({ err: error, args }, message);
  }

  fatal(message: string, error?: Error, ...args: unknown[]): void {
    this.logger.fatal({ err: error, args }, message);
  }

  /**
   * Create a child logger with a specific context
   * @param context Logger context
   * @returns Child logger
   */
  createChildLogger(context: string): ILogger {
    const childLogger = this.logger.child({ context });

    return {
      trace: (message: string, ...args: unknown[]): void => {
        childLogger.trace({ args }, message);
      },
      debug: (message: string, ...args: unknown[]): void => {
        childLogger.debug({ args }, message);
      },
      info: (message: string, ...args: unknown[]): void => {
        childLogger.info({ args }, message);
      },
      warn: (message: string, ...args: unknown[]): void => {
        childLogger.warn({ args }, message);
      },
      error: (message: string, error?: Error, ...args: unknown[]): void => {
        childLogger.error({ err: error, args }, message);
      },
      fatal: (message: string, error?: Error, ...args: unknown[]): void => {
        childLogger.fatal({ err: error, args }, message);
      },
    };
  }
}
