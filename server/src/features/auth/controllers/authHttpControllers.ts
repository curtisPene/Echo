import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { loginService } from "../services/loginService";
import { registrationService } from "../services/registrationService";
import { verifyRefreshTokenService } from "../services/verifyRefreshTokenService";
import { userLoginSchema, userRegistrationSchema } from "../types";

export const userLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = userLoginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: { errors: parsed.error.issues },
    });
  }

  const { email, password } = parsed.data;

  const loginResult = await loginService({ email, password });

  if (!loginResult.success) {
    return res.status(404).json({
      success: false,
      message: loginResult.message,
      data: null,
    });
  }

  res
    .cookie("refreshToken", loginResult.data.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    })
    .json({
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken: loginResult.data.accessToken,
        user: loginResult.data.user,
      },
    })
    .status(201);
};

export const userRegistrationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const parsed = userRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: { errors: parsed.error.issues },
    });
  }

  const { firstName, lastName, email, password } = parsed.data;

  const result = await registrationService({
    firstName,
    lastName,
    email,
    password,
  });

  if (!result.success) {
    const status = result.data.reason === "duplicate_email" ? 409 : 400;
    return res.status(status).json({
      success: false,
      message: result.message,
      data: result.data,
    });
  }

  res.status(201).json({
    success: true,
    message: result.message,
    data: result.data,
  });
};

export const verifyRefreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No credentials provided",
      data: null,
    });
  }
  const result = await verifyRefreshTokenService({
    refreshToken: cookies.refreshToken,
  });

  if (!result.success || !result.data) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized - Invalid",
      data: null,
    });
  }

  return res.status(202).json({
    success: true,
    message: "Authorized",
    data: {
      user: result.data.user,
      accessToken: result.data.accessToken,
    },
  });
};
