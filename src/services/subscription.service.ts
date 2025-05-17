import {
  type Subscription,
  type CreateSubscriptionDto,
  SubscriptionFrequency,
  SubscriptionStatus,
  type SubscriptionResponseDto,
} from "../models/subscription.model";
import { BadRequestError } from "../utils/errors";
import { ErrorMessage } from "../constants/error-message.enum";
import type {
  ISubscriptionService,
  ISubscriptionRepository,
  ITokenService,
  IEmailService,
  IWeatherService,
  ICronService,
} from "../core/interfaces/services.interface";
import { SubscriptionNotFoundError } from "../core/errors";

/**
 * Service for subscription business logic
 */
export class SubscriptionService implements ISubscriptionService {
  private subscriptionRepository: ISubscriptionRepository;
  private tokenService: ITokenService;
  private emailService: IEmailService;
  private weatherService: IWeatherService;
  private logger: {
    info: (msg: string) => void;
    error: (msg: string, err?: Error) => void;
  };
  private cronService?: ICronService; // Make it optional for backward compatibility

  constructor(
    subscriptionRepository: ISubscriptionRepository,
    tokenService: ITokenService,
    emailService: IEmailService,
    weatherService: IWeatherService,
    logger: {
      info: (msg: string) => void;
      error: (msg: string, err?: Error) => void;
    },
    cronService?: ICronService, // Move optional parameter to the end
  ) {
    this.subscriptionRepository = subscriptionRepository;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.weatherService = weatherService;
    this.logger = logger;
    this.cronService = cronService;
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
      throw new SubscriptionNotFoundError(); // Use the declared variable
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

    // Schedule cron job for this subscription if cronService is available
    if (this.cronService) {
      await this.cronService.scheduleJob(updatedSubscription.id);
      this.logger.info(
        `Scheduled cron job for subscription ${updatedSubscription.id}`,
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
      throw new SubscriptionNotFoundError(); // Use the declared variable
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

    // Cancel cron job for this subscription if cronService is available
    if (this.cronService) {
      this.cronService.cancelJob(updatedSubscription.id);
      this.logger.info(
        `Cancelled cron job for subscription ${updatedSubscription.id}`,
      );
    }

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
