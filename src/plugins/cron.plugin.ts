import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { CronService } from "../services/cron.service";
import { WeatherService } from "../services/weather.service";
import { EmailService } from "../services/email.service";
import type { PrismaService, PrismaClientType } from "../db/prisma.service";
import type { ICronService } from "../core/interfaces/services.interface";

const cronPlugin: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Create logger adapter
  const logger = {
    info: (msg: string): void => {
      fastify.log.info(`[Cron] ${msg}`);
    },
    error: (msg: string, err?: Error): void => {
      fastify.log.error({ err, msg: `[Cron] ${msg}` });
    },
  };

  // Get Prisma client
  const prismaService = fastify.db as PrismaService;

  // Create services
  const weatherService = new WeatherService(fastify.config.WEATHER_API_KEY);
  const emailService = new EmailService(
    fastify.config.RESEND_API_KEY,
    fastify.config.EMAIL_FROM,
    fastify.config.BASE_URL,
    logger,
  );

  // Create a fallback cron service implementation
  const fallbackCronService: ICronService = {
    initializeJobs: async (): Promise<void> => {
      logger.info("Using fallback cron service - jobs will not run");
    },
    scheduleJob: async (): Promise<void> => {
      logger.info("Using fallback cron service - job not scheduled");
    },
    cancelJob: (): void => {
      logger.info("Using fallback cron service - no job to cancel");
    },
    getJobIds: (): string[] => {
      return [];
    },
    forceRunJob: async (): Promise<void> => {
      logger.info("Using fallback cron service - cannot force run job");
    },
  };

  // Create cron service with proper typing
  let cronService: ICronService;
  try {
    const prismaClient = prismaService.getPrismaClient();
    cronService = new CronService(
      prismaClient as PrismaClientType,
      weatherService,
      emailService,
      logger,
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("Failed to create cron service", err);
    // Use the fallback implementation to prevent server startup failure
    cronService = fallbackCronService;
  }

  // Make the cron service available through the fastify instance
  fastify.decorate("cron", cronService);

  // Initialize cron jobs after server is ready
  fastify.addHook("onReady", async () => {
    try {
      await cronService.initializeJobs();
      logger.info("Cron jobs initialized successfully");
    } catch (error) {
      logger.error(
        "Failed to initialize cron jobs",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  });

  // Stop all cron jobs when the server is closing
  fastify.addHook("onClose", async () => {
    try {
      // Get all job IDs and cancel them
      const jobIds = cronService.getJobIds();
      jobIds.forEach((id) => cronService.cancelJob(id));

      logger.info("All cron jobs stopped");
    } catch (error) {
      logger.error(
        "Error stopping cron jobs",
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  });
};

export default fastifyPlugin(cronPlugin);

// Type declaration for the fastify instance with cron
declare module "fastify" {
  interface FastifyInstance {
    cron: ICronService;
  }
}
