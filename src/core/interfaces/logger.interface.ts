/**
 * Interface for logger service
 */
export interface ILogger {
  trace(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, error?: Error, ...args: unknown[]): void;
  fatal(message: string, error?: Error, ...args: unknown[]): void;
}
