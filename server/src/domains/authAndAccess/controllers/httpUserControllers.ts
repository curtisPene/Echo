import { NextFunction, Request, Response } from "express";
import { deleteUserAccountService } from "../composition";

export const deleteAccountController = async (
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

  const serviceResult = await deleteUserAccountService.execute({
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
