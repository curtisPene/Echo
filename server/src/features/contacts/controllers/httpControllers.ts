import { NextFunction, Request, Response } from "express";
import { findUserService } from "../../users/services/findUserService";
import { searchContactsRequestSchema } from "../types";
import { addContactService } from "../services/addContactService";

export const searchContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  if (!email || !req.user) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: null,
    });
  }

  const parsed = searchContactsRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: null,
    });
  }

  const result = await findUserService({
    ...parsed.data,
    viewerId: req.user.id,
  });

  if (!result.success) {
    return res.status(404).json({
      success: false,
      message: result.message,
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    message: result.message,
    data: result.data.user,
  });
};

export const addContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { contactId } = req.body;

  if (!contactId || !req.user) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  const serviceResult = await addContactService({
    userId: req.user.id,
    contactId,
  });

  if (!serviceResult.success) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message,
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    message: "Contact added successfully",
    data: serviceResult.data.addedUser,
  });
};
