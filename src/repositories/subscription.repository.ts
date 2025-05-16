import type { PrismaClient } from "@prisma/client";
import type { IDatabaseClient } from "../db/database.interface";
import type {
  Subscription,
  SubscriptionFrequency,
  SubscriptionStatus,
} from "../models/subscription.model";
import {
  DatabaseError,
  SubscriptionExistsError,
  SubscriptionNotFoundError,
} from "../utils/errors";
import { ErrorMessage } from "../constants/error-message.enum";
import { PrismaService } from "../db/prisma.service";

// Define a type for the Prisma Subscription model
interface PrismaSubscription {
  id: string;
  email: string;
  city: string;
  frequency: string;
  status: string;
  token: string;
  tokenExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSentAt: Date | null;
  nextScheduledAt: Date | null;
}

/**
 * Repository for subscription data access using Prisma
 */
export class SubscriptionRepository {
  private prisma: PrismaClient;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(
    dbClient: IDatabaseClient,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.logger = logger;

    // Get Prisma client from the database service
    if (dbClient instanceof PrismaService) {
      // Use type assertion with a more specific type
      this.prisma = dbClient.getPrismaClient() as unknown as PrismaClient;
    } else {
      throw new Error("Database service must be an instance of PrismaService");
    }
  }

  /**
   * Create a new subscription
   * @param subscription Subscription data
   * @returns Created subscription
   * @throws {SubscriptionExistsError} If subscription already exists
   * @throws {DatabaseError} If database operation fails
   */
  async create(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription> {
    try {
      // Log the subscription data for debugging
      this.logger.info(
        `Creating subscription for email=${subscription.email}, city=${subscription.city}`,
      );

      // Create the subscription using Prisma
      const result = await this.prisma.subscription.create({
        data: {
          email: subscription.email,
          city: subscription.city,
          frequency: subscription.frequency,
          status: subscription.status,
          token: subscription.token,
          tokenExpiry: subscription.tokenExpiry,
        },
      });

      // Map the result to a Subscription object
      return this.mapPrismaToSubscription(result as PrismaSubscription);
    } catch (error) {
      // Handle unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint failed")
      ) {
        throw new SubscriptionExistsError();
      }

      // Log and wrap other errors
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to create subscription", err);

      // If it's already a DatabaseError, just re-throw it
      if (error instanceof DatabaseError) {
        throw error;
      }

      // Otherwise, wrap it in a DatabaseError
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Find a subscription by email and city
   * @param email Email address
   * @param city City name
   * @returns Subscription or null if not found
   * @throws {DatabaseError} If database operation fails
   */
  async findByEmailAndCity(
    email: string,
    city: string,
  ): Promise<Subscription | null> {
    try {
      const result = await this.prisma.subscription.findUnique({
        where: {
          email_city: {
            email,
            city,
          },
        },
      });

      if (!result) {
        return null;
      }

      return this.mapPrismaToSubscription(result as PrismaSubscription);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to find subscription by email and city", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Find a subscription by token
   * @param token Subscription token
   * @returns Subscription or null if not found
   * @throws {DatabaseError} If database operation fails
   */
  async findByToken(token: string): Promise<Subscription | null> {
    try {
      const result = await this.prisma.subscription.findUnique({
        where: {
          token,
        },
      });

      if (!result) {
        return null;
      }

      return this.mapPrismaToSubscription(result as PrismaSubscription);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to find subscription by token", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Update a subscription
   * @param id Subscription ID
   * @param data Data to update
   * @returns Updated subscription
   * @throws {SubscriptionNotFoundError} If subscription not found
   * @throws {DatabaseError} If database operation fails
   */
  async update(
    id: string,
    data: Partial<Pick<Subscription, "status" | "token" | "tokenExpiry">>,
  ): Promise<Subscription> {
    try {
      const result = await this.prisma.subscription.update({
        where: {
          id,
        },
        data: {
          status: data.status,
          token: data.token,
          tokenExpiry: data.tokenExpiry,
        },
      });

      return this.mapPrismaToSubscription(result as PrismaSubscription);
    } catch (error) {
      // Handle record not found
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        throw new SubscriptionNotFoundError();
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to update subscription", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Update subscription scheduling information
   * @param id Subscription ID
   * @param lastSentAt Last sent time
   * @param nextScheduledAt Next scheduled time
   * @returns Updated subscription
   * @throws {SubscriptionNotFoundError} If subscription not found
   * @throws {DatabaseError} If database operation fails
   */
  async updateScheduling(
    id: string,
    lastSentAt: Date | null,
    nextScheduledAt: Date | null,
  ): Promise<Subscription> {
    try {
      const result = await this.prisma.subscription.update({
        where: {
          id,
        },
        data: {
          lastSentAt,
          nextScheduledAt,
        },
      });

      return this.mapPrismaToSubscription(result as PrismaSubscription);
    } catch (error) {
      // Handle record not found
      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        throw new SubscriptionNotFoundError();
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to update subscription scheduling", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Get all active subscriptions
   * @returns List of active subscriptions
   * @throws {DatabaseError} If database operation fails
   */
  async findAllActive(): Promise<Subscription[]> {
    try {
      const results = await this.prisma.subscription.findMany({
        where: {
          status: "CONFIRMED",
        },
      });

      return results.map((result) =>
        this.mapPrismaToSubscription(result as PrismaSubscription),
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to find active subscriptions", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Get subscriptions due for sending
   * @returns List of subscriptions due for sending
   * @throws {DatabaseError} If database operation fails
   */
  async findDueForSending(): Promise<Subscription[]> {
    try {
      const now = new Date();

      const results = await this.prisma.subscription.findMany({
        where: {
          status: "CONFIRMED",
          OR: [{ nextScheduledAt: null }, { nextScheduledAt: { lte: now } }],
        },
      });

      return results.map((result) =>
        this.mapPrismaToSubscription(result as PrismaSubscription),
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to find subscriptions due for sending", err);
      throw new DatabaseError(
        `${ErrorMessage.DATABASE_QUERY_ERROR}: ${err.message}`,
        { cause: err },
      );
    }
  }

  /**
   * Map a Prisma subscription to a Subscription object
   * @param prismaSubscription Prisma subscription
   * @returns Subscription object
   */
  private mapPrismaToSubscription(
    prismaSubscription: PrismaSubscription,
  ): Subscription {
    return {
      id: prismaSubscription.id,
      email: prismaSubscription.email,
      city: prismaSubscription.city,
      frequency: prismaSubscription.frequency as SubscriptionFrequency,
      status: prismaSubscription.status as SubscriptionStatus,
      token: prismaSubscription.token,
      tokenExpiry: prismaSubscription.tokenExpiry,
      createdAt: prismaSubscription.createdAt,
      updatedAt: prismaSubscription.updatedAt,
      lastSentAt: prismaSubscription.lastSentAt,
      nextScheduledAt: prismaSubscription.nextScheduledAt,
    };
  }
}
