import { SubscriptionController } from "../../controllers/subscription.controller";
import { BadRequestError } from "../../utils/errors";
import { ErrorMessage } from "../../core/constants";
import {
  SubscriptionFrequency,
  SubscriptionStatus,
} from "../../models/subscription.model";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

describe("SubscriptionController", () => {
  // Mock dependencies
  const mockSubscriptionService = {
    createSubscription: jest.fn(),
    confirmSubscription: jest.fn(),
    unsubscribe: jest.fn(),
  };

  // Mock request and reply
  const mockRequest = {
    body: {},
    params: {},
  } as any;

  const mockReply = {
    send: jest.fn(),
    code: jest.fn().mockReturnThis(),
  } as any;

  let subscriptionController: SubscriptionController;

  beforeEach(() => {
    jest.clearAllMocks();
    subscriptionController = new SubscriptionController(
      mockSubscriptionService,
    );
  });

  describe("subscribe", () => {
    it("should create a subscription successfully", async () => {
      // Arrange
      const subscriptionData = {
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
      };

      mockRequest.body = subscriptionData;

      const subscription = {
        id: "123",
        ...subscriptionData,
        status: SubscriptionStatus.PENDING,
        createdAt: new Date(),
      };

      mockSubscriptionService.createSubscription.mockResolvedValue(
        subscription,
      );

      // Act
      await subscriptionController.subscribe(mockRequest, mockReply);

      // Assert
      expect(mockSubscriptionService.createSubscription).toHaveBeenCalledWith(
        subscriptionData,
      );
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Subscription successful. Confirmation email sent.",
        subscription,
      });
    });

    it("should throw BadRequestError if email is missing", async () => {
      // Arrange
      mockRequest.body = {
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
      };

      // Act & Assert
      await expect(
        subscriptionController.subscribe(mockRequest, mockReply),
      ).rejects.toThrow(
        new BadRequestError(ErrorMessage.MISSING_REQUIRED_FIELD),
      );

      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if city is missing", async () => {
      // Arrange
      mockRequest.body = {
        email: "test@example.com",
        frequency: SubscriptionFrequency.DAILY,
      };

      // Act & Assert
      await expect(
        subscriptionController.subscribe(mockRequest, mockReply),
      ).rejects.toThrow(
        new BadRequestError(ErrorMessage.MISSING_REQUIRED_FIELD),
      );

      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if frequency is missing", async () => {
      // Arrange
      mockRequest.body = {
        email: "test@example.com",
        city: "London",
      };

      // Act & Assert
      await expect(
        subscriptionController.subscribe(mockRequest, mockReply),
      ).rejects.toThrow(
        new BadRequestError(ErrorMessage.MISSING_REQUIRED_FIELD),
      );

      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it("should throw BadRequestError if frequency is invalid", async () => {
      // Arrange
      mockRequest.body = {
        email: "test@example.com",
        city: "London",
        frequency: "weekly", // Invalid frequency
      };

      // Act & Assert
      await expect(
        subscriptionController.subscribe(mockRequest, mockReply),
      ).rejects.toThrow(new BadRequestError(ErrorMessage.INVALID_FREQUENCY));

      expect(mockSubscriptionService.createSubscription).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe("confirmSubscription", () => {
    it("should confirm a subscription successfully", async () => {
      // Arrange
      const token = "test-token";
      mockRequest.params = { token };

      const subscription = {
        id: "123",
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
        status: SubscriptionStatus.CONFIRMED,
        createdAt: new Date(),
      };

      mockSubscriptionService.confirmSubscription.mockResolvedValue(
        subscription,
      );

      // Act
      await subscriptionController.confirmSubscription(mockRequest, mockReply);

      // Assert
      expect(mockSubscriptionService.confirmSubscription).toHaveBeenCalledWith(
        token,
      );
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Subscription confirmed successfully.",
        subscription,
      });
    });

    it("should throw BadRequestError if token is missing", async () => {
      // Arrange
      mockRequest.params = {}; // No token

      // Act & Assert
      await expect(
        subscriptionController.confirmSubscription(mockRequest, mockReply),
      ).rejects.toThrow(
        new BadRequestError(ErrorMessage.INVALID_SUBSCRIPTION_TOKEN),
      );

      expect(
        mockSubscriptionService.confirmSubscription,
      ).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe successfully", async () => {
      // Arrange
      const token = "test-token";
      mockRequest.params = { token };

      const subscription = {
        id: "123",
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
        status: SubscriptionStatus.UNSUBSCRIBED,
        createdAt: new Date(),
      };

      mockSubscriptionService.unsubscribe.mockResolvedValue(subscription);

      // Act
      await subscriptionController.unsubscribe(mockRequest, mockReply);

      // Assert
      expect(mockSubscriptionService.unsubscribe).toHaveBeenCalledWith(token);
      expect(mockReply.code).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        message: "Unsubscribed successfully.",
        subscription,
      });
    });

    it("should throw BadRequestError if token is missing", async () => {
      // Arrange
      mockRequest.params = {}; // No token

      // Act & Assert
      await expect(
        subscriptionController.unsubscribe(mockRequest, mockReply),
      ).rejects.toThrow(
        new BadRequestError(ErrorMessage.INVALID_SUBSCRIPTION_TOKEN),
      );

      expect(mockSubscriptionService.unsubscribe).not.toHaveBeenCalled();
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });
});
