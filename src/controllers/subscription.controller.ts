import type { FastifyRequest, FastifyReply } from "fastify";
import type { ISubscriptionService } from "../core/interfaces/services.interface";
import {
  type CreateSubscriptionDto,
  SubscriptionFrequency,
} from "../models/subscription.model";
import { BadRequestError } from "../utils/errors";
import { ErrorMessage } from "../core/constants";

/**
 * Request with token parameter
 */
interface RequestWithToken {
  Params: {
    token: string;
  };
}

/**
 * Controller for subscription endpoints
 */
export class SubscriptionController {
  private subscriptionService: ISubscriptionService;

  constructor(subscriptionService: ISubscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  /**
   * Create a new subscription
   * @param request Request with subscription data
   * @param reply Reply object
   */
  async subscribe(
    request: FastifyRequest<{
      Body: { email: string; city: string; frequency: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { email, city, frequency } = request.body;

    if (!email || !city || !frequency) {
      throw new BadRequestError(ErrorMessage.MISSING_REQUIRED_FIELD);
    }

    // Validate frequency
    if (
      !Object.values(SubscriptionFrequency).includes(
        frequency as SubscriptionFrequency,
      )
    ) {
      throw new BadRequestError(ErrorMessage.INVALID_FREQUENCY);
    }

    const subscriptionData: CreateSubscriptionDto = {
      email,
      city,
      frequency: frequency as SubscriptionFrequency,
    };

    try {
      const subscription =
        await this.subscriptionService.createSubscription(subscriptionData);

      reply.code(200).send({
        message: "Subscription successful. Confirmation email sent.",
        subscription,
      });
    } catch (error) {
      // Re-throw the error to be handled by the error middleware
      throw error;
    }
  }

  /**
   * Confirm a subscription
   * @param request Request with token parameter
   * @param reply Reply object
   */
  async confirmSubscription(
    request: FastifyRequest<RequestWithToken>,
    reply: FastifyReply,
  ): Promise<void> {
    const { token } = request.params;

    if (!token) {
      throw new BadRequestError(ErrorMessage.INVALID_SUBSCRIPTION_TOKEN);
    }

    try {
      const subscription =
        await this.subscriptionService.confirmSubscription(token);

      reply.code(200).send({
        message: "Subscription confirmed successfully.",
        subscription,
      });
    } catch (error) {
      // Re-throw the error to be handled by the error middleware
      throw error;
    }
  }

  /**
   * Unsubscribe from weather updates
   * @param request Request with token parameter
   * @param reply Reply object
   */
  async unsubscribe(
    request: FastifyRequest<RequestWithToken>,
    reply: FastifyReply,
  ): Promise<void> {
    const { token } = request.params;

    if (!token) {
      throw new BadRequestError(ErrorMessage.INVALID_SUBSCRIPTION_TOKEN);
    }

    try {
      const subscription = await this.subscriptionService.unsubscribe(token);

      reply.code(200).send({
        message: "Unsubscribed successfully.",
        subscription,
      });
    } catch (error) {
      // Re-throw the error to be handled by the error middleware
      throw error;
    }
  }
}
