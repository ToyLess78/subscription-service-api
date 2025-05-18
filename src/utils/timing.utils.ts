import { addHours, addDays, isAfter } from "date-fns";
import { SubscriptionFrequency } from "../models/subscription.model";

/**
 * Utility functions for handling timing and scheduling
 */
export class TimingUtils {
  /**
   * Get cron expression for a frequency
   * @param frequency Subscription frequency
   * @returns Cron expression
   */
  static getCronExpression(frequency: SubscriptionFrequency): string {
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
  static calculateNextScheduledTime(
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
   * Check if it's time to send an email
   * @param nextScheduledAt Next scheduled time
   * @returns True if it's time to send, false otherwise
   */
  static isTimeToSend(nextScheduledAt?: Date | null): boolean {
    const now = new Date();
    return !nextScheduledAt || isAfter(now, nextScheduledAt);
  }
}
