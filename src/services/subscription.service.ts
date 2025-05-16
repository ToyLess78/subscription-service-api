import {
  type Subscription,
  type CreateSubscriptionDto,
  SubscriptionFrequency,
  SubscriptionStatus,
  type SubscriptionResponseDto,
} from "../models/subscription.model";
import type { SubscriptionRepository } from "../repositories/subscription.repository";
import type { TokenService } from "./token.service";
import type { EmailService } from "./email.service";
import type { WeatherService } from "./weather.service";
import { BadRequestError, SubscriptionNotFoundError } from "../utils/errors";
import { ErrorMessage } from "../constants/error-message.enum";

/**
 * Service for subscription business logic
 */
export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private tokenService: TokenService;
  private emailService: EmailService;
  private weatherService: WeatherService;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };

  constructor(
    subscriptionRepository: SubscriptionRepository,
    tokenService: TokenService,
    emailService: EmailService,
    weatherService: WeatherService,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
  ) {
    this.subscriptionRepository = subscriptionRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.weatherService = weatherService;
    this.logger = logger;
  }

  /**
   * Create a new subscription
   * @param data Subscription data
   * @returns Created subscription
   * @throws {BadRequestError} If data is invalid
   * @throws {SubscriptionExistsError} If subscription already exists
   */
  async createSubscription(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto> {
    // Validate frequency
    if (!Object.values(SubscriptionFrequency).includes(data.frequency)) {
      throw new BadRequestError(ErrorMessage.INVALID_FREQUENCY);
    }

    // Generate token
    const { token, expiry } = this.tokenService.generateToken();

    // Create subscription
    const subscription = await this.subscriptionRepository.create({
      email: data.email,
      city: data.city,
      frequency: data.frequency,
      status: SubscriptionStatus.PENDING,
      token,
      tokenExpiry: expiry,
    });

    // Send confirmation email
    await this.emailService.sendConfirmationEmail(
      data.email,
      token,
      data.city,
      data.frequency,
    );

    return this.mapToResponseDto(subscription);
  }

  /**
   * Confirm a subscription
   * @param token Confirmation token
   * @returns Confirmed subscription
   * @throws {SubscriptionNotFoundError} If subscription not found
   * @throws {InvalidTokenError} If token is invalid
   */
  async confirmSubscription(token: string): Promise<SubscriptionResponseDto> {
    // Find subscription by token
    const subscription = await this.subscriptionRepository.findByToken(token);
    if (!subscription) {
      throw new SubscriptionNotFoundError();
    }

    // Validate token
    this.tokenService.validateToken(token, subscription.tokenExpiry);

    // Generate new token for unsubscribe functionality
    const { token: newToken, expiry } = this.tokenService.generateToken();

    // Update subscription
    const updatedSubscription = await this.subscriptionRepository.update(
      subscription.id,
      {
        status: SubscriptionStatus.CONFIRMED,
        token: newToken,
        tokenExpiry: expiry,
      },
    );

    // Get current weather for the city
    try {
      const weatherData = await this.weatherService.getCurrentWeather(
        subscription.city,
      );

      // Send welcome email with current weather
      await this.emailService.sendWelcomeEmail(
        subscription.email,
        newToken,
        subscription.city,
        subscription.frequency,
        weatherData.description,
        weatherData.temperature.celsius.toString(),
      );
    } catch (error) {
      // If weather fetch fails, still send welcome email but without weather data
      this.logger.error(
        "Failed to fetch weather for welcome email",
        error instanceof Error ? error : new Error(String(error)),
      );

      await this.emailService.sendWelcomeEmail(
        subscription.email,
        newToken,
        subscription.city,
        subscription.frequency,
      );
    }

    return this.mapToResponseDto(updatedSubscription);
  }

  /**
   * Unsubscribe from weather updates
   * @param token Unsubscribe token
   * @returns Unsubscribed subscription
   * @throws {SubscriptionNotFoundError} If subscription not found
   * @throws {InvalidTokenError} If token is invalid
   */
  async unsubscribe(token: string): Promise<SubscriptionResponseDto> {
    // Find subscription by token
    const subscription = await this.subscriptionRepository.findByToken(token);
    if (!subscription) {
      throw new SubscriptionNotFoundError();
    }

    // Validate token
    this.tokenService.validateToken(token, subscription.tokenExpiry);

    // Update subscription
    const updatedSubscription = await this.subscriptionRepository.update(
      subscription.id,
      {
        status: SubscriptionStatus.UNSUBSCRIBED,
      },
    );

    // Send unsubscribe confirmation email
    await this.emailService.sendUnsubscribeConfirmationEmail(
      subscription.email,
      subscription.city,
    );

    return this.mapToResponseDto(updatedSubscription);
  }

  /**
   * Map a Subscription to a SubscriptionResponseDto
   * @param subscription Subscription entity
   * @returns SubscriptionResponseDto
   */
  private mapToResponseDto(
    subscription: Subscription,
  ): SubscriptionResponseDto {
    return {
      id: subscription.id,
      email: subscription.email,
      city: subscription.city,
      frequency: subscription.frequency,
      status: subscription.status,
      createdAt: subscription.createdAt,
    };
  }
}
