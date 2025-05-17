import type { IDatabaseClient } from "./database.interface";
import { DatabaseService } from "./database.service";
import { PrismaService } from "./prisma.service";

export enum DatabaseType {
  MEMORY = "memory",
  PRISMA = "prisma",
}

export class DatabaseFactory {
  /**
   * Create a database client based on the specified type
   * @param type Database type
   * @param logger Logger instance
   * @returns Database client instance
   */
  static createDatabaseClient(
    type: DatabaseType,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ): IDatabaseClient {
    switch (type) {
      case DatabaseType.MEMORY:
        return new DatabaseService({ url: "memory://test" }, logger);
      case DatabaseType.PRISMA:
      default:
        return new PrismaService(logger);
    }
  }
}
