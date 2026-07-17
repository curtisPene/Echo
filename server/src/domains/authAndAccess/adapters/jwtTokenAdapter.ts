import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types/authTypes";
import type { TokenSigner } from "../ports/TokenSigner";

const secret = process.env.JWT_SECRET ?? "";

export class JwtTokenSigner implements TokenSigner {
  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, secret, { expiresIn: "15m" });
  }

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, secret, { expiresIn: "7d" });
  }

  verifyAccessToken(token: string): TokenPayload | null {
    return this.verify(token);
  }

  verifyRefreshToken(token: string): TokenPayload | null {
    return this.verify(token);
  }

  private verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, secret);

      if (typeof decoded === "string" || !decoded.id) return null;

      return { id: decoded.id };
    } catch {
      return null;
    }
  }
}
