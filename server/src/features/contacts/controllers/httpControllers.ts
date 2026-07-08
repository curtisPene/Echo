import { NextFunction, Request, Response } from "express";
import { findUserService } from "../../users/services/findUserService";
import { userPresenter } from "../../users/presenters/usersPresenter";
import { searchContactsRequestSchema } from "../types";
import { addContactService } from "../services/addContactService";
import { contactPresenter } from "../presenters/contactsPresenter";

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

  const user = userPresenter(result.data.user);

  res.status(201).json({
    success: true,
    message: result.message,
    data: user,
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

  const addedContactView = contactPresenter(serviceResult.data.addedUser);

  res.status(201).json({
    success: true,
    message: "Contact added successfully",
    data: addedContactView,
  });
};
