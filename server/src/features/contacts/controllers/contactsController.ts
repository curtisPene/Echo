import { NextFunction, Request, Response } from "express";
import { findUserService } from "../../users/services/findUserService";
import { searchContactsRequestSchema } from "../types";
import { addContactService } from "../services/addContactService";
import { toPublicUser } from "../../users/models/userModel";

export const searchContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  if (!email) {
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
      data: { errors: parsed.error.issues },
    });
  }

  const result = await findUserService(parsed.data);

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

  const addeduser = await addContactService({ userId: req.user.id, contactId });

  res.status(201).json({
    success: true,
    message: "Contact added successfully",
    data: addeduser,
  });
};
