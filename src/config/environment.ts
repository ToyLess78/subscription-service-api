import { z } from "zod";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Ensure .env file exists
const ensureEnvFile = (): void => {
  const envPath = path.resolve(process.cwd(), ".env");
  const envExamplePath = path.resolve(process.cwd(), ".env.example");

  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.warn("Creating .env file from .env.example...");
    fs.copyFileSync(envExamplePath, envPath);
    console.warn(".env file created successfully");
  }
};

// Call the function to ensure .env file exists
ensureEnvFile();

// Define environment variable schema using Zod
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  HOST: z.string().default("localhost"),
  API_VERSION: z.string().default("v1"),
  BASE_URL: z.string().default("http://localhost:3000"),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  PRETTY_LOGS: z.string().default("true"),

  // Database
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (url) => url.startsWith("postgresql://") || url.startsWith("postgres://"),
      {
        message: "DATABASE_URL must start with postgresql:// or postgres://",
      },
    ),
  DATABASE_CONNECTION_TIMEOUT: z.string().default("5000"),

  // External APIs
  WEATHER_API_KEY: z.string(),
  RESEND_API_KEY: z.string().optional(),

  // Application specific
  EMAIL_FROM: z.string().email().default("onboarding@resend.dev"),
  TOKEN_EXPIRY: z.string().default("86400"), // 24 hours in seconds
});

// Parse and validate environment variables
const parseEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((e) => e.code === "invalid_type" && e.received === "undefined")
        .map((e) => e.path.join("."));

      const invalidVars = error.errors
        .filter((e) => e.code !== "invalid_type" || e.received !== "undefined")
        .map((e) => `${e.path.join(".")}: ${e.message}`);

      if (missingVars.length > 0) {
        console.error(
          `Missing required environment variables: ${missingVars.join(", ")}`,
        );
      }

      if (invalidVars.length > 0) {
        console.error(
          `Invalid environment variables:\n${invalidVars.join("\n")}`,
        );
      }
    } else {
      console.error("Unknown error validating environment variables:", error);
    }
    process.exit(1);
  }
};

// Export validated environment variables
export const env = parseEnv();

// Export types
export type Environment = z.infer<typeof envSchema>;
