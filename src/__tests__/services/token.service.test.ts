import { TokenService } from "../../services/token.service";
import { ExpiredTokenError, InvalidTokenError } from "../../utils/errors";

describe("TokenService", () => {
  let tokenService: TokenService;
  const tokenExpirySeconds = 3600; // 1 hour

  beforeEach(() => {
    tokenService = new TokenService(tokenExpirySeconds);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("generateToken", () => {
    it("should generate a token of correct length", () => {
      const { token } = tokenService.generateToken();
      // Updated to match the actual token length (64 characters for SHA-256 hex)
      expect(token).toHaveLength(64);
      expect(typeof token).toBe("string");
    });

    it("should generate a token with correct expiry time", () => {
      const now = new Date();
      jest.setSystemTime(now);

      const { token, expiry } = tokenService.generateToken();

      // Token should be a non-empty string
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      // Expiry should be tokenExpirySeconds in the future
      const expectedExpiry = new Date(
        now.getTime() + tokenExpirySeconds * 1000,
      );
      expect(expiry.getTime()).toBe(expectedExpiry.getTime());
    });

    it("should generate a non-expiring token when noExpiry is true", () => {
      const { token, expiry } = tokenService.generateToken(true);

      // Token should be a non-empty string
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);

      // Expiry should be set to January 1, 2100
      const farFutureDate = new Date(4102444800000);
      expect(expiry.getTime()).toBe(farFutureDate.getTime());
    });

    it("should generate unique tokens on consecutive calls", () => {
      const { token: token1 } = tokenService.generateToken();
      const { token: token2 } = tokenService.generateToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("validateToken", () => {
    it("should not throw for a valid non-expired token", () => {
      const now = new Date();
      jest.setSystemTime(now);

      const expiry = new Date(now.getTime() + 1000); // 1 second in the future

      expect(() => {
        tokenService.validateToken("valid-token", expiry);
      }).not.toThrow();
    });

    it("should throw InvalidTokenError for an empty token", () => {
      const expiry = new Date(Date.now() + 1000);

      expect(() => {
        tokenService.validateToken("", expiry);
      }).toThrow(InvalidTokenError);
    });

    it("should throw ExpiredTokenError for an expired token", () => {
      const now = new Date();
      jest.setSystemTime(now);

      const expiry = new Date(now.getTime() - 1000); // 1 second in the past

      expect(() => {
        tokenService.validateToken("expired-token", expiry);
      }).toThrow(ExpiredTokenError);
    });

    it("should not throw for an expired token when isUnsubscribeToken is true", () => {
      const now = new Date();
      jest.setSystemTime(now);

      const expiry = new Date(now.getTime() - 1000); // 1 second in the past

      expect(() => {
        tokenService.validateToken("expired-token", expiry, true);
      }).not.toThrow();
    });
  });
});
