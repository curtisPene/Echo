import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types";

const accessSecret = process.env.JWT_ACCESS_SECRET ?? "";
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? "";

export const tokenAdapter = {
  signAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, accessSecret, { expiresIn: "15m" });
  },

  signRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, refreshSecret, { expiresIn: "7d" });
  },

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, accessSecret);

      if (typeof decoded === "string" || !decoded.id) return null;

      return { id: decoded.id };
    } catch {
      return null;
    }
  },

  verifyRefreshToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, refreshSecret);

      if (typeof decoded === "string" || !decoded.id) return null;

      return { id: decoded.id };
    } catch {
      return null;
    }
  },
};
