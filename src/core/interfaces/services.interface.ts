import type { WeatherData } from "../../models/weather.model";
import type {
  Subscription,
  CreateSubscriptionDto,
  SubscriptionResponseDto,
} from "../../models/subscription.model";

/**
 * Interface for weather service
 */
export interface IWeatherService {
  getCurrentWeather(city: string): Promise<WeatherData>;
}

/**
 * Interface for token service
 */
export interface ITokenService {
  generateToken(): { token: string; expiry: Date };
  validateToken(token: string, expiry: Date): void;
}

/**
 * Interface for email service
 */
export interface IEmailService {
  sendConfirmationEmail(
    to: string,
    token: string,
    city: string,
    frequency: string,
  ): Promise<void>;
  sendWelcomeEmail(
    to: string,
    token: string,
    city: string,
    frequency: string,
    currentWeather?: string,
    temperature?: string,
  ): Promise<void>;
  sendUnsubscribeConfirmationEmail(to: string, city: string): Promise<void>;
  sendWeatherUpdateEmail(
    to: string,
    token: string,
    city: string,
    frequency: string,
    currentWeather?: string,
    temperature?: string,
  ): Promise<void>;
}

/**
 * Interface for subscription service
 */
export interface ISubscriptionService {
  createSubscription(
    data: CreateSubscriptionDto,
  ): Promise<SubscriptionResponseDto>;
  confirmSubscription(token: string): Promise<SubscriptionResponseDto>;
  unsubscribe(token: string): Promise<SubscriptionResponseDto>;
}

/**
 * Interface for cron service
 */
export interface ICronService {
  initializeJobs(): Promise<void>;
  scheduleJob(subscriptionId: string): Promise<void>;
  cancelJob(subscriptionId: string): void;
  getJobIds(): string[];
  forceRunJob(subscriptionId: string): Promise<void>;
}

/**
 * Interface for subscription repository
 */
export interface ISubscriptionRepository {
  create(
    subscription: Omit<Subscription, "id" | "createdAt" | "updatedAt">,
  ): Promise<Subscription>;
  findByEmailAndCity(email: string, city: string): Promise<Subscription | null>;
  findByToken(token: string): Promise<Subscription | null>;
  update(
    id: string,
    data: Partial<
      Pick<
        Subscription,
        "status" | "token" | "tokenExpiry" | "lastSentAt" | "nextScheduledAt"
      >
    >,
  ): Promise<Subscription>;
  updateScheduling(
    id: string,
    lastSentAt: Date | null,
    nextScheduledAt: Date | null,
  ): Promise<Subscription>;
  findAllActive(): Promise<Subscription[]>;
  findDueForSending(): Promise<Subscription[]>;
}
