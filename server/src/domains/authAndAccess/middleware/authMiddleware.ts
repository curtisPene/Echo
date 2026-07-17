import { NextFunction, Request, Response } from "express";
import { verifyAccessTokenService } from "../composition";

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

  const result = verifyAccessTokenService.execute({ accessToken: token });

  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token",
      data: null,
    });
  }

  req.user = result.data;

  next();
};
