import { NextFunction, Request, Response } from "express";
import { tokenAdapter } from "../adapters/tokenAdapter";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const path = req.path;

  const isPublicRoute =
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/verify" ||
    path === "/health";

  if (isPublicRoute) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No credentials provided",
      data: null,
    });
  }

  const payload = tokenAdapter.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token",
      data: null,
    });
  }

  req.user = payload;

  next();
};
