import { randomBytes } from "crypto";
import { ExpiredTokenError, InvalidTokenError } from "../utils/errors";

/**
 * Token service for generating and validating tokens
 */
export class TokenService {
  private tokenExpirySeconds: number;

  constructor(tokenExpirySeconds: number) {
    this.tokenExpirySeconds = tokenExpirySeconds;
  }

  /**
   * Generate a new token
   * @returns Token and expiry date
   */
  generateToken(): { token: string; expiry: Date } {
    const token = randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + this.tokenExpirySeconds * 1000);
    return { token, expiry };
  }

  /**
   * Validate a token
   * @param token Token to validate
   * @param expiry Token expiry date
   * @throws {InvalidTokenError} If token is invalid
   * @throws {ExpiredTokenError} If token has expired
   */
  validateToken(token: string, expiry: Date): void {
    if (!token) {
      throw new InvalidTokenError();
    }

    if (new Date() > expiry) {
      throw new ExpiredTokenError();
    }
  }
}
