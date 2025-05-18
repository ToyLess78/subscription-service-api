import { SubscriptionService } from "../../services/subscription.service";
import { mockLogger } from "../mocks";
import {
  SubscriptionFrequency,
  SubscriptionStatus,
  type Subscription,
} from "../../models/subscription.model";
import { BadRequestError, SubscriptionNotFoundError } from "../../utils/errors";
import { ErrorMessage } from "../../core/constants";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type {
  ISubscriptionRepository,
  ITokenService,
  IEmailService,
  IWeatherService,
  ICronService,
} from "../../core/interfaces/services.interface";
import type { WeatherData } from "../../models/weather.model";

describe("SubscriptionService", () => {
  // Mock dependencies with proper typing
  const mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository> = {
    create: jest.fn(),
    findByEmailAndCity: jest.fn(),
    findByToken: jest.fn(),
    update: jest.fn(),
    updateScheduling: jest.fn(),
    findAllActive: jest.fn(),
    findDueForSending: jest.fn(),
    delete: jest.fn(),
  };

  const mockTokenService: jest.Mocked<ITokenService> = {
    generateToken: jest.fn(),
    validateToken: jest.fn(),
  };

  const mockEmailService: jest.Mocked<IEmailService> = {
    sendConfirmationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendUnsubscribeConfirmationEmail: jest.fn(),
    sendWeatherUpdateEmail: jest.fn(),
  };

  const mockWeatherService: jest.Mocked<IWeatherService> = {
    getCurrentWeather: jest.fn(),
  };

  const mockCronService: jest.Mocked<ICronService> = {
    initializeJobs: jest.fn(),
    scheduleJob: jest.fn(),
    cancelJob: jest.fn(),
    getJobIds: jest.fn(),
    forceRunJob: jest.fn(),
  };

  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    jest.clearAllMocks();

    subscriptionService = new SubscriptionService(
      mockSubscriptionRepository,
      mockTokenService,
      mockEmailService,
      mockWeatherService,
      mockLogger,
      mockCronService,
    );
  });

  describe("createSubscription", () => {
    it("should create a subscription successfully", async () => {
      // Arrange
      const subscriptionData = {
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
      };

      const token = "test-token";
      const expiry = new Date();
      mockTokenService.generateToken.mockReturnValue({ token, expiry });

      const createdSubscription: Subscription = {
        id: "123",
        email: subscriptionData.email,
        city: subscriptionData.city,
        frequency: subscriptionData.frequency,
        status: SubscriptionStatus.PENDING,
        token,
        tokenExpiry: expiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSubscriptionRepository.create.mockResolvedValue(createdSubscription);

      // Act
      const result =
        await subscriptionService.createSubscription(subscriptionData);

      // Assert
      expect(mockTokenService.generateToken).toHaveBeenCalled();
      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith({
        email: subscriptionData.email,
        city: subscriptionData.city,
        frequency: subscriptionData.frequency,
        status: SubscriptionStatus.PENDING,
        token,
        tokenExpiry: expiry,
      });
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalledWith(
        subscriptionData.email,
        token,
        subscriptionData.city,
        subscriptionData.frequency,
      );
      expect(result).toEqual({
        id: createdSubscription.id,
        email: createdSubscription.email,
        city: createdSubscription.city,
        frequency: createdSubscription.frequency,
        status: createdSubscription.status,
        createdAt: createdSubscription.createdAt,
      });
    });

    it("should throw BadRequestError for invalid frequency", async () => {
      // Arrange
      const subscriptionData = {
        email: "test@example.com",
        city: "London",
        frequency: "weekly" as SubscriptionFrequency, // Invalid frequency
      };

      // Act & Assert
      await expect(
        subscriptionService.createSubscription(subscriptionData),
      ).rejects.toThrow(new BadRequestError(ErrorMessage.INVALID_FREQUENCY));

      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
      expect(mockSubscriptionRepository.create).not.toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).not.toHaveBeenCalled();
    });
  });

  describe("confirmSubscription", () => {
    it("should confirm a subscription successfully", async () => {
      // Arrange
      const token = "test-token";
      const subscription: Subscription = {
        id: "123",
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
        status: SubscriptionStatus.PENDING,
        token,
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByToken.mockResolvedValue(subscription);

      const newToken = "new-token";
      const newExpiry = new Date();
      mockTokenService.generateToken.mockReturnValue({
        token: newToken,
        expiry: newExpiry,
      });

      const updatedSubscription: Subscription = {
        ...subscription,
        status: SubscriptionStatus.CONFIRMED,
        token: newToken,
        tokenExpiry: newExpiry,
      };
      mockSubscriptionRepository.update.mockResolvedValue(updatedSubscription);

      const weatherData: WeatherData = {
        city: "London",
        country: "UK",
        temperature: { celsius: 20, fahrenheit: 68 },
        humidity: 70,
        description: "Sunny",
        icon: "sun.png",
      };
      mockWeatherService.getCurrentWeather.mockResolvedValue(weatherData);

      // Act
      const result = await subscriptionService.confirmSubscription(token);

      // Assert
      expect(mockSubscriptionRepository.findByToken).toHaveBeenCalledWith(
        token,
      );
      expect(mockTokenService.validateToken).toHaveBeenCalledWith(
        token,
        subscription.tokenExpiry,
      );
      expect(mockTokenService.generateToken).toHaveBeenCalled();
      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        subscription.id,
        {
          status: SubscriptionStatus.CONFIRMED,
          token: newToken,
          tokenExpiry: newExpiry,
        },
      );
      expect(mockWeatherService.getCurrentWeather).toHaveBeenCalledWith(
        subscription.city,
      );
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        subscription.email,
        newToken,
        subscription.city,
        subscription.frequency,
        "Sunny",
        "20",
      );
      expect(mockCronService.scheduleJob).toHaveBeenCalledWith(subscription.id);
      expect(result).toEqual({
        id: updatedSubscription.id,
        email: updatedSubscription.email,
        city: updatedSubscription.city,
        frequency: updatedSubscription.frequency,
        status: updatedSubscription.status,
        createdAt: updatedSubscription.createdAt,
      });
    });

    it("should throw SubscriptionNotFoundError if subscription not found", async () => {
      // Arrange
      const token = "test-token";
      mockSubscriptionRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(
        subscriptionService.confirmSubscription(token),
      ).rejects.toThrow(SubscriptionNotFoundError);

      expect(mockSubscriptionRepository.findByToken).toHaveBeenCalledWith(
        token,
      );
      expect(mockTokenService.validateToken).not.toHaveBeenCalled();
      expect(mockSubscriptionRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(mockCronService.scheduleJob).not.toHaveBeenCalled();
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe successfully", async () => {
      // Arrange
      const token = "test-token";
      const subscription: Subscription = {
        id: "123",
        email: "test@example.com",
        city: "London",
        frequency: SubscriptionFrequency.DAILY,
        status: SubscriptionStatus.CONFIRMED,
        token,
        tokenExpiry: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSubscriptionRepository.findByToken.mockResolvedValue(subscription);
      mockSubscriptionRepository.delete.mockResolvedValue(true);

      // Act
      const result = await subscriptionService.unsubscribe(token);

      // Assert
      expect(mockSubscriptionRepository.findByToken).toHaveBeenCalledWith(
        token,
      );
      expect(mockTokenService.validateToken).toHaveBeenCalledWith(
        token,
        subscription.tokenExpiry,
        true,
      );
      expect(mockCronService.cancelJob).toHaveBeenCalledWith(subscription.id);
      expect(mockSubscriptionRepository.delete).toHaveBeenCalledWith(
        subscription.id,
      );
      expect(
        mockEmailService.sendUnsubscribeConfirmationEmail,
      ).toHaveBeenCalledWith(subscription.email, subscription.city);
      expect(result).toEqual({
        id: subscription.id,
        email: subscription.email,
        city: subscription.city,
        frequency: subscription.frequency,
        status: SubscriptionStatus.UNSUBSCRIBED,
        createdAt: subscription.createdAt,
      });
    });

    it("should throw SubscriptionNotFoundError if subscription not found", async () => {
      // Arrange
      const token = "test-token";
      mockSubscriptionRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(subscriptionService.unsubscribe(token)).rejects.toThrow(
        SubscriptionNotFoundError,
      );

      expect(mockSubscriptionRepository.findByToken).toHaveBeenCalledWith(
        token,
      );
      expect(mockTokenService.validateToken).not.toHaveBeenCalled();
      expect(mockCronService.cancelJob).not.toHaveBeenCalled();
      expect(mockSubscriptionRepository.delete).not.toHaveBeenCalled();
      expect(
        mockEmailService.sendUnsubscribeConfirmationEmail,
      ).not.toHaveBeenCalled();
    });
  });
});
