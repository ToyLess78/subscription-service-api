import { CronJob } from "cron";
import type { PrismaClientType } from "../db/prisma.service";
import {
  SubscriptionFrequency,
  SubscriptionStatus,
} from "../models/subscription.model";
import type { WeatherService } from "./weather.service";
import type { EmailService } from "./email.service";
import { addHours, addDays, isAfter } from "date-fns";

// Define types for Prisma queries
interface SubscriptionQueryResult {
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
 * Service for managing cron jobs for scheduled email delivery
 */
export class CronService {
  // Change from private to protected to allow access in plugin
  protected jobs: Map<string, CronJob> = new Map();
  private prisma: PrismaClientType;
  private weatherService: WeatherService;
  private emailService: EmailService;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(
    prisma: PrismaClientType,
    weatherService: WeatherService,
    emailService: EmailService,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.prisma = prisma;
    this.weatherService = weatherService;
    this.emailService = emailService;
    this.logger = logger;
  }

  /**
   * Initialize cron jobs for all active subscriptions
   */
  async initializeJobs(): Promise<void> {
    try {
      this.logger.info("Initializing cron jobs for active subscriptions...");

      // Get all confirmed subscriptions
      const subscriptions = (await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.CONFIRMED,
        },
      })) as SubscriptionQueryResult[];

      // Initialize jobs for each subscription
      for (const subscription of subscriptions) {
        await this.scheduleJob(subscription.id);
      }

      this.logger.info(`Initialized ${subscriptions.length} cron jobs`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("Failed to initialize cron jobs", err);
    }
  }

  /**
   * Schedule a job for a subscription
   * @param subscriptionId Subscription ID
   */
  async scheduleJob(subscriptionId: string): Promise<void> {
    try {
      // Get subscription details
      const subscription = (await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      })) as SubscriptionQueryResult | null;

      if (
        !subscription ||
        subscription.status !== SubscriptionStatus.CONFIRMED
      ) {
        this.logger.info(
          `Subscription ${subscriptionId} is not active, skipping job scheduling`,
        );
        return;
      }

      // Cancel existing job if it exists
      this.cancelJob(subscriptionId);

      // Determine cron expression based on frequency
      const cronExpression = this.getCronExpression(
        subscription.frequency as SubscriptionFrequency,
      );

      // Calculate next scheduled time
      const nextScheduledAt = this.calculateNextScheduledTime(
        subscription.frequency as SubscriptionFrequency,
        subscription.lastSentAt,
      );

      // Update next scheduled time in database
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: { nextScheduledAt },
      });

      // Create and start the cron job
      const job = new CronJob(
        cronExpression,
        () => this.executeJob(subscriptionId),
        null,
        true,
        "UTC",
      );

      // Store the job
      this.jobs.set(subscriptionId, job);

      this.logger.info(
        `Scheduled job for subscription ${subscriptionId} with frequency ${subscription.frequency}, next run at ${nextScheduledAt?.toISOString() || "unknown"}`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to schedule job for subscription ${subscriptionId}`,
        err,
      );
    }
  }

  /**
   * Cancel a job for a subscription
   * @param subscriptionId Subscription ID
   */
  cancelJob(subscriptionId: string): void {
    const job = this.jobs.get(subscriptionId);
    if (job) {
      job.stop();
      this.jobs.delete(subscriptionId);
      this.logger.info(`Cancelled job for subscription ${subscriptionId}`);
    }
  }

  /**
   * Get all job IDs
   * @returns Array of job IDs
   */
  getJobIds(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Execute a job for a subscription
   * @param subscriptionId Subscription ID
   */
  private async executeJob(subscriptionId: string): Promise<void> {
    try {
      // Get subscription details
      const subscription = (await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
      })) as SubscriptionQueryResult | null;

      if (
        !subscription ||
        subscription.status !== SubscriptionStatus.CONFIRMED
      ) {
        this.logger.info(
          `Subscription ${subscriptionId} is not active, cancelling job`,
        );
        this.cancelJob(subscriptionId);
        return;
      }

      // Check if it's time to send the email
      const now = new Date();
      if (
        subscription.nextScheduledAt &&
        isAfter(subscription.nextScheduledAt, now)
      ) {
        this.logger.info(
          `Not yet time to send email for subscription ${subscriptionId}, next scheduled at ${subscription.nextScheduledAt.toISOString()}`,
        );
        return;
      }

      // Get weather data
      const weatherData = await this.weatherService.getCurrentWeather(
        subscription.city,
      );

      // Send email
      await this.emailService.sendWeatherUpdateEmail(
        subscription.email,
        subscription.token,
        subscription.city,
        subscription.frequency as SubscriptionFrequency,
        weatherData.description,
        weatherData.temperature.celsius.toString(),
      );

      // Calculate next scheduled time
      const nextScheduledAt = this.calculateNextScheduledTime(
        subscription.frequency as SubscriptionFrequency,
      );

      // Update last sent time and next scheduled time in database
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          lastSentAt: now,
          nextScheduledAt,
        },
      });

      this.logger.info(
        `Sent weather update email for subscription ${subscriptionId}, next scheduled at ${nextScheduledAt.toISOString()}`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to execute job for subscription ${subscriptionId}`,
        err,
      );
    }
  }

  /**
   * Get cron expression for a frequency
   * @param frequency Subscription frequency
   * @returns Cron expression
   */
  private getCronExpression(frequency: SubscriptionFrequency): string {
    switch (frequency) {
      case SubscriptionFrequency.HOURLY:
        // Run at the beginning of each hour
        return "0 * * * *";
      case SubscriptionFrequency.DAILY:
        // Run at 8:00 AM each day
        return "0 8 * * *";
      default:
        // Default to daily at 8:00 AM
        return "0 8 * * *";
    }
  }

  /**
   * Calculate next scheduled time based on frequency
   * @param frequency Subscription frequency
   * @param lastSentAt Last sent time (optional)
   * @returns Next scheduled time
   */
  private calculateNextScheduledTime(
    frequency: SubscriptionFrequency,
    lastSentAt?: Date | null,
  ): Date {
    const now = new Date();

    // If no last sent time, schedule immediately
    if (!lastSentAt) {
      return now;
    }

    switch (frequency) {
      case SubscriptionFrequency.HOURLY:
        return addHours(lastSentAt, 1);
      case SubscriptionFrequency.DAILY:
        return addDays(lastSentAt, 1);
      default:
        return addDays(lastSentAt, 1);
    }
  }

  /**
   * Force run a job for a subscription (for testing)
   * @param subscriptionId Subscription ID
   */
  async forceRunJob(subscriptionId: string): Promise<void> {
    await this.executeJob(subscriptionId);
  }
}
