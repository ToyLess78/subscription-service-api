import type { FastifyPluginAsync } from "fastify";
import { SubscriptionController } from "../controllers/subscription.controller";
import { SubscriptionService } from "../services/subscription.service";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { TokenService } from "../services/token.service";
import { EmailService } from "../services/email.service";
import { WeatherService } from "../services/weather.service";
import { ApiPath } from "../constants/api-path.enum";
import { SubscriptionFrequency } from "../models/subscription.model";

const subscriptionRoutes: FastifyPluginAsync = async (fastify) => {
  // Create dependencies
  const logger = {
    info: (msg: string) => fastify.log.info(`[Subscription] ${msg}`),
    error: (msg: string, err?: Error) =>
      fastify.log.error({ err, msg: `[Subscription] ${msg}` }),
  };

  const subscriptionRepository = new SubscriptionRepository(fastify.db, logger);
  const tokenService = new TokenService(Number(fastify.config.TOKEN_EXPIRY));
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.EMAIL_FROM,
    fastify.config.BASE_URL,
    logger,
  );
  const weatherService = new WeatherService(fastify.config.WEATHER_API_KEY);
  const subscriptionService = new SubscriptionService(
    subscriptionRepository,
    tokenService,
    emailService,
    weatherService,
    logger,
  );
  const subscriptionController = new SubscriptionController(
    subscriptionService,
  );

  // POST /subscribe endpoint
  fastify.post(ApiPath.SUBSCRIBE, {
    schema: {
      tags: ["subscription"],
      summary: "Subscribe to weather updates",
      description:
        "Subscribe an email to receive weather updates for a specific city with chosen frequency.",
      body: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Email address to subscribe",
          },
          city: {
            type: "string",
            description: "City for weather updates",
          },
          frequency: {
            type: "string",
            enum: Object.values(SubscriptionFrequency),
            description: "Frequency of updates (hourly or daily)",
          },
        },
        required: ["email", "city", "frequency"],
      },
      response: {
        200: {
          description: "Subscription successful. Confirmation email sent.",
          type: "object",
          properties: {
            message: { type: "string" },
            subscription: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                city: { type: "string" },
                frequency: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        400: {
          description: "Invalid input",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        409: {
          description: "Email already subscribed",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        500: {
          description: "Server error",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    handler: subscriptionController.subscribe.bind(subscriptionController),
  });

  // GET /api/v1/confirm/:token endpoint
  fastify.get(`${ApiPath.CONFIRM}/:token`, {
    schema: {
      tags: ["subscription"],
      summary: "Confirm email subscription",
      description:
        "Confirms a subscription using the token sent in the confirmation email.",
      params: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "Confirmation token",
          },
        },
        required: ["token"],
      },
      response: {
        200: {
          description: "Subscription confirmed successfully",
          type: "object",
          properties: {
            message: { type: "string" },
            subscription: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                city: { type: "string" },
                frequency: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        400: {
          description: "Invalid token",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        404: {
          description: "Token not found",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        500: {
          description: "Server error",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    handler: subscriptionController.confirmSubscription.bind(
      subscriptionController,
    ),
  });

  // GET /api/v1/unsubscribe/:token endpoint
  fastify.get(`${ApiPath.UNSUBSCRIBE}/:token`, {
    schema: {
      tags: ["subscription"],
      summary: "Unsubscribe from weather updates",
      description:
        "Unsubscribes an email from weather updates using the token sent in emails.",
      params: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "Unsubscribe token",
          },
        },
        required: ["token"],
      },
      response: {
        200: {
          description: "Unsubscribed successfully",
          type: "object",
          properties: {
            message: { type: "string" },
            subscription: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                city: { type: "string" },
                frequency: { type: "string" },
                status: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        400: {
          description: "Invalid token",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        404: {
          description: "Token not found",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
        500: {
          description: "Server error",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    handler: subscriptionController.unsubscribe.bind(subscriptionController),
  });
};

export default subscriptionRoutes;
