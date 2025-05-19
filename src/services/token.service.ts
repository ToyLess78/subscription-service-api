import { randomBytes } from "crypto";
import { ExpiredTokenError, InvalidTokenError } from "../utils/errors";
import type { ITokenService } from "../core/interfaces/services.interface";

/**
 * Token service for generating and validating tokens
 */
export class TokenService implements ITokenService {
  private tokenExpirySeconds: number;

  constructor(tokenExpirySeconds = 86400) {
    this.tokenExpirySeconds = tokenExpirySeconds;
  }

  /**
   * Generate a new token
   * @param noExpiry Whether the token should never expire (for unsubscribe tokens)
   * @returns Token and expiry date
   */
  generateToken(noExpiry = false): { token: string; expiry: Date } {
    const token = randomBytes(32).toString("hex");
    // For non-expiring tokens, set expiry date to a far future date (year 2100)
    const expiry = noExpiry
      ? new Date(4102444800000) // January 1, 2100
      : new Date(Date.now() + this.tokenExpirySeconds * 1000);
    return { token, expiry };
  }

  /**
   * Validate a token
   * @param token Token to validate
   * @param expiry Token expiry date
   * @param isUnsubscribeToken Whether this is an unsubscribeToken (optional expiry check)
   * @throws {InvalidTokenError} If token is invalid
   * @throws {ExpiredTokenError} If token has expired
   */
  validateToken(token: string, expiry: Date, isUnsubscribeToken = false): void {
    if (!token) {
      throw new InvalidTokenError();
    }

    // Skip expiration check for unsubscribe tokens
    if (!isUnsubscribeToken && new Date() > expiry) {
      throw new ExpiredTokenError();
    }
  }
}
