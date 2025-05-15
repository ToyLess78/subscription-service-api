import { SubscriptionFrequency, SubscriptionStatus } from "./subscription.model"

/**
 * Subscription schema for validation and documentation
 */
export const subscriptionSchema = {
  $id: "subscription",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the subscription",
    },
    email: {
      type: "string",
      format: "email",
      description: "Email address for the subscription",
    },
    city: {
      type: "string",
      description: "City for weather updates",
    },
    frequency: {
      type: "string",
      enum: Object.values(SubscriptionFrequency),
      description: "Frequency of weather updates",
    },
    status: {
      type: "string",
      enum: Object.values(SubscriptionStatus),
      description: "Status of the subscription",
    },
    token: {
      type: "string",
      description: "Token for subscription confirmation or unsubscription",
    },
    tokenExpiry: {
      type: "string",
      format: "date-time",
      description: "Expiry date for the token",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Date when the subscription was created",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Date when the subscription was last updated",
    },
  },
  required: ["email", "city", "frequency"],
}

/**
 * Create subscription request schema
 */
export const createSubscriptionSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      description: "Email address for the subscription",
    },
    city: {
      type: "string",
      description: "City for weather updates",
    },
    frequency: {
      type: "string",
      enum: Object.values(SubscriptionFrequency),
      description: "Frequency of weather updates",
    },
  },
  required: ["email", "city", "frequency"],
}

/**
 * Subscription response schema
 */
export const subscriptionResponseSchema = {
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Unique identifier for the subscription",
    },
    email: {
      type: "string",
      format: "email",
      description: "Email address for the subscription",
    },
    city: {
      type: "string",
      description: "City for weather updates",
    },
    frequency: {
      type: "string",
      enum: Object.values(SubscriptionFrequency),
      description: "Frequency of weather updates",
    },
    status: {
      type: "string",
      enum: Object.values(SubscriptionStatus),
      description: "Status of the subscription",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Date when the subscription was created",
    },
  },
}

/**
 * Error response schema
 */
export const errorResponseSchema = {
  type: "object",
  properties: {
    error: {
      type: "string",
      description: "Error message",
    },
  },
}

/**
 * Success response schema
 */
export const successResponseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Success message",
    },
  },
}
