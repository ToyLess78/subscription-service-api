/**
 * Subscription frequency options
 */
export enum SubscriptionFrequency {
  HOURLY = "hourly",
  DAILY = "daily",
}

/**
 * Subscription status options
 */
export enum SubscriptionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  UNSUBSCRIBED = "unsubscribed",
}

/**
 * Subscription model interface
 */
export interface Subscription {
  id: string;
  email: string;
  city: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  token: string;
  tokenExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create subscription DTO
 */
export interface CreateSubscriptionDto {
  email: string;
  city: string;
  frequency: SubscriptionFrequency;
}

/**
 * Subscription response DTO
 */
export interface SubscriptionResponseDto {
  id: string;
  email: string;
  city: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  createdAt: Date;
}
