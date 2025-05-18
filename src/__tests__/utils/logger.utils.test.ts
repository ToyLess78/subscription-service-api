import {
  redactSensitiveInfo,
  formatError,
  createLogMessage,
} from "../../utils/logger.utils";
import { describe, it, expect } from "@jest/globals";

describe("Logger Utilities", () => {
  describe("redactSensitiveInfo", () => {
    it("should redact sensitive information at the specified paths", () => {
      const obj = {
        user: {
          name: "John Doe",
          email: "john@example.com",
          password: "secret123",
        },
        request: {
          headers: {
            authorization: "Bearer token123",
            "content-type": "application/json",
          },
        },
      };

      const paths = ["user.password", "request.headers.authorization"];
      const redacted = redactSensitiveInfo(obj, paths);

      // Original object should not be modified
      expect(obj.user.password).toBe("secret123");
      expect(obj.request.headers.authorization).toBe("Bearer token123");

      // Redacted object should have redacted values
      expect(redacted.user.password).toBe("[REDACTED]");
      expect(redacted.request.headers.authorization).toBe("[REDACTED]");

      // Other properties should remain unchanged
      expect(redacted.user.name).toBe("John Doe");
      expect(redacted.user.email).toBe("john@example.com");
      expect(redacted.request.headers["content-type"]).toBe("application/json");
    });

    it("should handle non-existent paths gracefully", () => {
      const obj = {
        user: {
          name: "John Doe",
        },
      };

      const paths = ["user.password", "request.headers.authorization"];
      const redacted = redactSensitiveInfo(obj, paths);

      // Object should remain unchanged
      expect(redacted).toEqual(obj);
    });

    it("should handle nested objects correctly", () => {
      const obj = {
        level1: {
          level2: {
            level3: {
              sensitive: "secret",
              normal: "value",
            },
          },
        },
      };

      const paths = ["level1.level2.level3.sensitive"];
      const redacted = redactSensitiveInfo(obj, paths);

      expect(redacted.level1.level2.level3.sensitive).toBe("[REDACTED]");
      expect(redacted.level1.level2.level3.normal).toBe("value");
    });
  });

  describe("formatError", () => {
    it("should format an error without stack trace", () => {
      const error = new Error("Test error");
      error.name = "TestError";

      const formatted = formatError(error, false);

      expect(formatted.message).toBe("Test error");
      expect(formatted.name).toBe("TestError");
      expect(formatted.stack).toBeUndefined();
    });

    it("should format an error with stack trace", () => {
      const error = new Error("Test error");
      error.name = "TestError";

      const formatted = formatError(error, true);

      expect(formatted.message).toBe("Test error");
      expect(formatted.name).toBe("TestError");
      expect(formatted.stack).toBeDefined();
    });

    it("should format an error with cause", () => {
      const cause = new Error("Cause error");
      const error = new Error("Test error", { cause });

      const formatted = formatError(error, true);

      expect(formatted.message).toBe("Test error");
      expect(formatted.cause).toBeDefined();
      expect(formatted.cause?.message).toBe("Cause error");
    });
  });

  describe("createLogMessage", () => {
    it("should create a log message with timestamp", () => {
      const message = "Test message";
      const result = createLogMessage(message);

      expect(result.message).toBe(message);
      expect(result.timestamp).toBeDefined();
      expect(typeof result.timestamp).toBe("string");
    });

    it("should include additional data in the log message", () => {
      const message = "Test message";
      const data = { userId: "123", action: "login" };
      const result = createLogMessage(message, data);

      expect(result.message).toBe(message);
      expect(result.timestamp).toBeDefined();
      expect(result.userId).toBe("123");
      expect(result.action).toBe("login");
    });
  });
});
