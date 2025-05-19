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
import { ErrorMessage } from "../core/constants";
import {
  PrismaService,
  type SubscriptionModel,
  type PrismaClientType,
} from "../db/prisma.service";
import type { ISubscriptionRepository } from "../core/interfaces/services.interface";

/**
 * Repository for subscription data access using Prisma
 */
export class SubscriptionRepository implements ISubscriptionRepository {
  private prisma: PrismaClientType;
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
      this.prisma = dbClient.getPrismaClient();
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

      // Create the subscription data with proper typing
      const subscriptionData: {
        email: string;
        city: string;
        frequency: string;
        status: string;
        token: string;
        tokenExpiry: Date;
        lastSentAt: Date | null;
        nextScheduledAt: Date | null;
      } = {
        email: subscription.email,
        city: subscription.city,
        frequency: subscription.frequency,
        status: subscription.status,
        token: subscription.token,
        tokenExpiry: subscription.tokenExpiry,
        // Explicitly set to null if undefined
        lastSentAt: subscription.lastSentAt ?? null,
        nextScheduledAt: subscription.nextScheduledAt ?? null,
      };

      // Create the subscription using Prisma
      const result = await this.prisma.subscription.create({
        data: subscriptionData,
      });

      // Map the result to a Subscription object
      return this.mapPrismaToSubscription(result as SubscriptionModel);
    } catch (error) {
      // Handle unique constraint violation
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Unique constraint failed")) {
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

      return this.mapPrismaToSubscription(result as SubscriptionModel);
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

      return this.mapPrismaToSubscription(result as SubscriptionModel);
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
    data: Partial<
      Pick<
        Subscription,
        "status" | "token" | "tokenExpiry" | "lastSentAt" | "nextScheduledAt"
      >
    >,
  ): Promise<Subscription> {
    try {
      // Create an update object with only the fields that are provided
      const updateData: Record<string, unknown> = {};

      if (data.status !== undefined) updateData.status = data.status;
      if (data.token !== undefined) updateData.token = data.token;
      if (data.tokenExpiry !== undefined)
        updateData.tokenExpiry = data.tokenExpiry;
      if (data.lastSentAt !== undefined)
        updateData.lastSentAt = data.lastSentAt;
      if (data.nextScheduledAt !== undefined)
        updateData.nextScheduledAt = data.nextScheduledAt;

      const result = await this.prisma.subscription.update({
        where: {
          id,
        },
        data: updateData,
      });

      return this.mapPrismaToSubscription(result as SubscriptionModel);
    } catch (error) {
      // Handle record not found
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Record to update not found")) {
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
      // Create an update object with only the fields that are provided
      const updateData: Record<string, unknown> = {};

      if (lastSentAt !== undefined) updateData.lastSentAt = lastSentAt;
      if (nextScheduledAt !== undefined)
        updateData.nextScheduledAt = nextScheduledAt;

      const result = await this.prisma.subscription.update({
        where: {
          id,
        },
        data: updateData,
      });

      return this.mapPrismaToSubscription(result as SubscriptionModel);
    } catch (error) {
      // Handle record not found
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Record to update not found")) {
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

      // Type assertion for the results
      const typedResults = results as unknown as SubscriptionModel[];

      // Use explicit mapping with type safety
      return typedResults.map((result: SubscriptionModel) =>
        this.mapPrismaToSubscription(result),
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

      // Use a type-safe approach with a cast to the specific query structure
      const whereCondition = {
        status: "CONFIRMED",
        OR: [{ nextScheduledAt: null }, { nextScheduledAt: { lte: now } }],
      };

      const results = await this.prisma.subscription.findMany({
        where: whereCondition as unknown as Record<string, unknown>,
      });

      // Type assertion for the results
      const typedResults = results as unknown as SubscriptionModel[];

      // Use explicit mapping with type safety
      return typedResults.map((result: SubscriptionModel) =>
        this.mapPrismaToSubscription(result),
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
   * Delete a subscription
   * @param id Subscription ID
   * @returns True if deleted successfully
   * @throws {SubscriptionNotFoundError} If subscription not found
   * @throws {DatabaseError} If database operation fails
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.prisma.subscription.delete({
        where: {
          id,
        },
      });

      return !!result;
    } catch (error) {
      // Handle record not found
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("Record to delete does not exist")) {
        throw new SubscriptionNotFoundError();
      }

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to delete subscription", err);
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
    prismaSubscription: SubscriptionModel,
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
