import { Error as MongooseError } from "mongoose";
import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  if (err instanceof MongooseError) {
    return res.status(400).json({
      success: false,
      message: "Database error",
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
}
