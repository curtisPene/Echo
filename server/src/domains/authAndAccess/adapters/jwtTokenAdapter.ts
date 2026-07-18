import jwt from "jsonwebtoken";
import type { IdentityDTO } from "../domainModels/identity";
import type { TokenSigner } from "../ports/TokenSigner";

const secret = process.env.JWT_SECRET ?? "";

export class JwtTokenSigner implements TokenSigner {
  signAccessToken(payload: IdentityDTO): string {
    return jwt.sign(payload, secret, { expiresIn: "15m" });
  }

  signRefreshToken(payload: IdentityDTO): string {
    return jwt.sign(payload, secret, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): IdentityDTO | null {
    return this.verify(token);
  }

  verifyRefreshToken(token: string): IdentityDTO | null {
    return this.verify(token);
  }

  private verify(token: string): IdentityDTO | null {
    try {
      const decoded = jwt.verify(token, secret);

      if (
        typeof decoded === "string" ||
        !decoded.id ||
        !decoded.firstName ||
        !decoded.lastName ||
        !decoded.email
      ) {
        return null;
      }

      return {
        id: decoded.id,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  }
}
