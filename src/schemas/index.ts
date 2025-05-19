// Temperature schema
export const temperatureSchema = {
  type: "object",
  properties: {
    celsius: {
      type: "number",
      description: "Temperature in Celsius",
    },
    fahrenheit: {
      type: "number",
      description: "Temperature in Fahrenheit",
    },
  },
};

// Weather schema - exposed in Swagger
export const weatherSchema = {
  $id: "weather",
  type: "object",
  properties: {
    city: {
      type: "string",
      description: "Name of the city",
    },
    country: {
      type: "string",
      description: "Country where the city is located",
    },
    temperature: temperatureSchema,
    humidity: {
      type: "number",
      description: "Humidity percentage",
    },
    description: {
      type: "string",
      description: "Text description of the weather conditions",
    },
    icon: {
      type: "string",
      description: "URL to the weather condition icon",
    },
  },
};

// Weather request schema
export const weatherRequestSchema = {
  type: "object",
  properties: {
    city: {
      type: "string",
      description:
        "Name of the city to get weather for (e.g., London, New York, Tokyo)",
    },
  },
  required: ["city"],
};

// Subscription schema - exposed in Swagger
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
      enum: ["hourly", "daily"],
      description: "Frequency of weather updates",
    },
    status: {
      type: "string",
      enum: ["pending", "confirmed", "unsubscribed"],
      description: "Status of the subscription",
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
};

// Create subscription request schema
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
      enum: ["hourly", "daily"],
      description: "Frequency of weather updates",
    },
  },
  required: ["email", "city", "frequency"],
};

// Subscription response schema
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
      enum: ["hourly", "daily"],
      description: "Frequency of weather updates",
    },
    status: {
      type: "string",
      enum: ["pending", "confirmed", "unsubscribed"],
      description: "Status of the subscription",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Date when the subscription was created",
    },
  },
};

// Common response schemas - not exposed in Swagger
export const errorResponseSchema = {
  $id: "errorResponse",
  type: "object",
  properties: {
    error: {
      type: "string",
      description: "Error message",
    },
    details: {
      type: "object",
      description: "Additional error details (optional)",
      additionalProperties: true,
    },
  },
  required: ["error"],
};

export const successResponseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "Success message",
    },
  },
};

// Health check response schema - not exposed in Swagger
export const healthCheckResponseSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      description: "API status",
    },
    timestamp: {
      type: "string",
      description: "Current timestamp",
    },
    database: {
      type: "object",
      properties: {
        connected: {
          type: "boolean",
          description: "Database connection status",
        },
        lastConnected: {
          type: "string",
          nullable: true,
          description: "Last successful connection time",
        },
        connectionAttempts: {
          type: "number",
          description: "Number of connection attempts",
        },
      },
    },
  },
};
