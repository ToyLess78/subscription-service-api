import { describe, it, expect } from "@jest/globals";
import {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  WeatherApiError,
  InvalidCityError,
  DatabaseError,
  EmailError,
  SubscriptionError,
  SubscriptionExistsError,
  SubscriptionNotFoundError,
  InvalidTokenError,
  ExpiredTokenError,
} from "../../utils/errors";
import { ErrorMessage, HttpStatus } from "../../core/constants";

describe("Error Classes", () => {
  describe("AppError", () => {
    it("should create an AppError with custom message", () => {
      const message = "Test error message";
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.isOperational).toBe(true);
    });

    it("should create an AppError with custom options", () => {
      const message = "Test error message";
      const statusCode = 500;
      const cause = new Error("Cause error");
      const error = new AppError(message, statusCode, {
        isOperational: false,
        cause,
      });

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.isOperational).toBe(false);
      expect(error.cause).toBe(cause);
    });
  });

  describe("BadRequestError", () => {
    it("should create a BadRequestError with default message", () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.BAD_REQUEST);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.isOperational).toBe(true);
    });

    it("should create a BadRequestError with custom message", () => {
      const message = "Custom bad request message";
      const error = new BadRequestError(message);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("NotFoundError", () => {
    it("should create a NotFoundError with default message", () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("UnauthorizedError", () => {
    it("should create an UnauthorizedError with default message", () => {
      const error = new UnauthorizedError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.UNAUTHORIZED);
      expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("ForbiddenError", () => {
    it("should create a ForbiddenError with default message", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.FORBIDDEN);
      expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.isOperational).toBe(true);
    });
  });

  describe("InternalServerError", () => {
    it("should create an InternalServerError with default message", () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.INTERNAL_SERVER_ERROR);
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(false);
    });
  });

  describe("WeatherApiError", () => {
    it("should create a WeatherApiError with default values", () => {
      const error = new WeatherApiError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.WEATHER_API_ERROR);
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(true);
    });

    it("should create a WeatherApiError with custom message", () => {
      const message = "Custom weather API error";
      const error = new WeatherApiError(message);

      expect(error.message).toBe(message);
    });
  });

  describe("InvalidCityError", () => {
    it("should create an InvalidCityError with default message", () => {
      const error = new InvalidCityError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.INVALID_CITY);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("DatabaseError", () => {
    it("should create a DatabaseError with default message", () => {
      const error = new DatabaseError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.DATABASE_CONNECTION_ERROR);
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("EmailError", () => {
    it("should create an EmailError with default message", () => {
      const error = new EmailError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.EMAIL_SENDING_ERROR);
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe("SubscriptionError", () => {
    it("should create a SubscriptionError with default values", () => {
      const error = new SubscriptionError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.SUBSCRIPTION_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("SubscriptionExistsError", () => {
    it("should create a SubscriptionExistsError", () => {
      const error = new SubscriptionExistsError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.SUBSCRIPTION_ALREADY_EXISTS);
      expect(error.statusCode).toBe(HttpStatus.CONFLICT);
    });
  });

  describe("SubscriptionNotFoundError", () => {
    it("should create a SubscriptionNotFoundError", () => {
      const error = new SubscriptionNotFoundError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.SUBSCRIPTION_NOT_FOUND);
      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    });
  });

  describe("InvalidTokenError", () => {
    it("should create an InvalidTokenError", () => {
      const error = new InvalidTokenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.INVALID_SUBSCRIPTION_TOKEN);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe("ExpiredTokenError", () => {
    it("should create an ExpiredTokenError", () => {
      const error = new ExpiredTokenError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(ErrorMessage.EXPIRED_SUBSCRIPTION_TOKEN);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
