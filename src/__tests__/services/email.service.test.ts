import { EmailService } from "../../services/email.service";
import { mockLogger } from "../mocks";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Define the type for Resend's response
interface ResendEmailResponse {
  id: string;
}

// Mock Resend
jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest
            .fn()
            .mockReturnValue(Promise.resolve({ id: "mock-email-id" })),
        },
      };
    }),
  };
});

// Import fs and path before mocking to get their types
import * as fs from "fs";
import * as path from "path";

// Mock fs and path modules with proper type assertions
jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs") as typeof fs;
  return {
    ...actualFs,
    readFile: jest.fn(),
  };
});

jest.mock("path", () => {
  const actualPath = jest.requireActual("path") as typeof path;
  return {
    ...actualPath,
    join: jest.fn().mockReturnValue("/mock/path/to/template.html"),
  };
});

describe("EmailService", () => {
  let emailService: EmailService;
  const apiKey = "test_resend_key";
  const fromEmail = "test@example.com";
  const baseUrl = "http://localhost:3000";

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fs.readFile to return a template with placeholders
    (fs.readFile as unknown as jest.Mock).mockImplementation(
      (
        _path: string,
        _encoding: string,
        callback: (err: Error | null, data: string) => void,
      ) => {
        const template = `
        <!DOCTYPE html>
        <html>
        <body>
          <h1>{{city}}</h1>
          <p>{{frequency}}</p>
          <a href="{{confirmationUrl}}">Confirm</a>
          <a href="{{unsubscribeUrl}}">Unsubscribe</a>
          <p>{{currentWeather}}</p>
          <p>{{temperature}}</p>
        </body>
        </html>
      `;
        callback(null, template);
      },
    );

    emailService = new EmailService(apiKey, fromEmail, baseUrl, mockLogger);
  });

  describe("sendConfirmationEmail", () => {
    it("should send a confirmation email with correct parameters", async () => {
      const to = "user@example.com";
      const token = "test-token";
      const city = "London";
      const frequency = "daily";

      await emailService.sendConfirmationEmail(to, token, city, frequency);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending confirmation email"),
      );
      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        "public",
        "email-templates",
        "confirmation.html",
      );
      expect(fs.readFile).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      const to = "user@example.com";
      const token = "test-token";
      const city = "London";
      const frequency = "daily";

      // Mock Resend to throw an error
      const mockResendError = new Error("Resend API error");
      const mockResend = {
        emails: {
          send: jest.fn().mockReturnValue(Promise.reject(mockResendError)),
        },
      };

      // Use Object.defineProperty to set the private property
      Object.defineProperty(emailService, "resend", {
        value: mockResend,
        writable: true,
      });

      await emailService.sendConfirmationEmail(to, token, city, frequency);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to send confirmation email"),
        expect.any(Error),
      );
      // The service should log that it's continuing despite the error
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Continuing despite email error"),
      );
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send a welcome email with correct parameters", async () => {
      const to = "user@example.com";
      const token = "test-token";
      const city = "London";
      const frequency = "daily";
      const currentWeather = "Sunny";
      const temperature = "22";

      await emailService.sendWelcomeEmail(
        to,
        token,
        city,
        frequency,
        currentWeather,
        temperature,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending welcome email"),
      );
      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        "public",
        "email-templates",
        "welcome.html",
      );
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe("sendUnsubscribeConfirmationEmail", () => {
    it("should send an unsubscribe confirmation email with correct parameters", async () => {
      const to = "user@example.com";
      const city = "London";

      await emailService.sendUnsubscribeConfirmationEmail(to, city);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending unsubscribe confirmation email"),
      );
      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        "public",
        "email-templates",
        "unsubscribe.html",
      );
      expect(fs.readFile).toHaveBeenCalled();
    });
  });

  describe("sendWeatherUpdateEmail", () => {
    it("should send a weather update email with correct parameters", async () => {
      const to = "user@example.com";
      const token = "test-token";
      const city = "London";
      const frequency = "daily";
      const currentWeather = "Sunny";
      const temperature = "22";

      await emailService.sendWeatherUpdateEmail(
        to,
        token,
        city,
        frequency,
        currentWeather,
        temperature,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Sending weather update email"),
      );
      expect(path.join).toHaveBeenCalledWith(
        expect.any(String),
        "public",
        "email-templates",
        "welcome.html",
      );
      expect(fs.readFile).toHaveBeenCalled();
    });
  });
});
