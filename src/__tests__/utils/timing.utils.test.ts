import { TimingUtils } from "../../utils/timing.utils";
import { SubscriptionFrequency } from "../../models/subscription.model";
import { addHours, addDays, subHours } from "date-fns";
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

describe("TimingUtils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getCronExpression", () => {
    it("should return correct cron expression for hourly frequency", () => {
      const result = TimingUtils.getCronExpression(
        SubscriptionFrequency.HOURLY,
      );
      expect(result).toBe("0 * * * *");
    });

    it("should return correct cron expression for daily frequency", () => {
      const result = TimingUtils.getCronExpression(SubscriptionFrequency.DAILY);
      expect(result).toBe("0 8 * * *");
    });

    it("should return daily cron expression for unknown frequency", () => {
      // Using type assertion to test with invalid value
      const result = TimingUtils.getCronExpression(
        "invalid" as SubscriptionFrequency,
      );
      expect(result).toBe("0 8 * * *");
    });
  });

  describe("calculateNextScheduledTime", () => {
    it("should return current time if lastSentAt is null", () => {
      const now = new Date(2023, 0, 1, 12, 0, 0);
      jest.setSystemTime(now);

      const result = TimingUtils.calculateNextScheduledTime(
        SubscriptionFrequency.HOURLY,
        null,
      );
      expect(result.getTime()).toBe(now.getTime());
    });

    it("should return current time if lastSentAt is undefined", () => {
      const now = new Date(2023, 0, 1, 12, 0, 0);
      jest.setSystemTime(now);

      const result = TimingUtils.calculateNextScheduledTime(
        SubscriptionFrequency.HOURLY,
        undefined,
      );
      expect(result.getTime()).toBe(now.getTime());
    });

    it("should add 1 hour for hourly frequency", () => {
      const lastSentAt = new Date(2023, 0, 1, 12, 0, 0);
      const expected = addHours(lastSentAt, 1);

      const result = TimingUtils.calculateNextScheduledTime(
        SubscriptionFrequency.HOURLY,
        lastSentAt,
      );
      expect(result.getTime()).toBe(expected.getTime());
    });

    it("should add 1 day for daily frequency", () => {
      const lastSentAt = new Date(2023, 0, 1, 12, 0, 0);
      const expected = addDays(lastSentAt, 1);

      const result = TimingUtils.calculateNextScheduledTime(
        SubscriptionFrequency.DAILY,
        lastSentAt,
      );
      expect(result.getTime()).toBe(expected.getTime());
    });

    it("should add 1 day for unknown frequency", () => {
      const lastSentAt = new Date(2023, 0, 1, 12, 0, 0);
      const expected = addDays(lastSentAt, 1);

      // Using type assertion to test with invalid value
      const result = TimingUtils.calculateNextScheduledTime(
        "invalid" as SubscriptionFrequency,
        lastSentAt,
      );
      expect(result.getTime()).toBe(expected.getTime());
    });
  });

  describe("isTimeToSend", () => {
    it("should return true if nextScheduledAt is null", () => {
      const result = TimingUtils.isTimeToSend(null);
      expect(result).toBe(true);
    });

    it("should return true if nextScheduledAt is undefined", () => {
      const result = TimingUtils.isTimeToSend(undefined);
      expect(result).toBe(true);
    });

    it("should return true if nextScheduledAt is in the past", () => {
      const now = new Date(2023, 0, 1, 12, 0, 0);
      jest.setSystemTime(now);

      const nextScheduledAt = subHours(now, 1); // 1 hour in the past
      const result = TimingUtils.isTimeToSend(nextScheduledAt);

      expect(result).toBe(true);
    });

    it("should return false if nextScheduledAt is in the future", () => {
      const now = new Date(2023, 0, 1, 12, 0, 0);
      jest.setSystemTime(now);

      const nextScheduledAt = addHours(now, 1); // 1 hour in the future
      const result = TimingUtils.isTimeToSend(nextScheduledAt);

      expect(result).toBe(false);
    });
  });
});
