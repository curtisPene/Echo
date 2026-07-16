import jwt from "jsonwebtoken";
import type { TokenPayload } from "../types";

const secret = process.env.JWT_SECRET ?? "";

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "15m" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !decoded.id) return null;

    return { id: decoded.id };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !decoded.id) return null;

    return { id: decoded.id };
  } catch {
    return null;
  }
}
