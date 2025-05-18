// Global test setup
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Set default environment variables for testing
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test_db";
process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || "test_api_key";
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || "test_resend_key";
process.env.EMAIL_FROM = process.env.EMAIL_FROM || "test@example.com";
process.env.BASE_URL = process.env.BASE_URL || "http://localhost:3000";
process.env.TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "86400";

// No global mocks here - we'll add them in each test file
