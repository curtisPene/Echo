import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import { LoginService } from "../services/LoginService";
import { RegistrationService } from "../services/RegistrationService";
import { VerifyRefreshTokenService } from "../services/VerifyRefreshTokenService";
import { DeleteUserAccountService } from "../services/DeleteUserAccountService";
import { userLoginSchema, userRegistrationSchema } from "../types/authTypes";

export class AuthControllers {
  constructor(
    private readonly loginService: LoginService,
    private readonly registrationService: RegistrationService,
    private readonly verifyRefreshTokenService: VerifyRefreshTokenService,
    private readonly deleteUserAccountService: DeleteUserAccountService,
  ) {}

  userLoginController = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = userLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const { email, password } = parsed.data;

    const loginResult = await this.loginService.execute({ email, password });

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
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(201)
      .json({
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken: loginResult.data.accessToken,
          user: loginResult.data.user,
        },
      });
  };

  userRegistrationController = async (req: Request, res: Response, next: NextFunction) => {
    const parsed = userRegistrationSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        data: { reason: "validation" },
      });
    }

    const { firstName, lastName, email, password, confirmPassword } = parsed.data;

    const result = await this.registrationService.execute({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
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

  verifyRefreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;

    if (!cookies?.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No credentials provided",
        data: null,
      });
    }
    const result = await this.verifyRefreshTokenService.execute({
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

  deleteAccountController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No credentials provided",
        data: null,
      });
    }

    const serviceResult = await this.deleteUserAccountService.execute({
      user: req.user,
    });

    if (!serviceResult.success) {
      return res.status(404).json({
        success: false,
        message: serviceResult.message,
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: null,
    });
  };
}
