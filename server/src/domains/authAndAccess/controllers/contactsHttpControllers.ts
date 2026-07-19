import { NextFunction, Request, Response } from "express";
import { SearchUserService } from "../services/SearchUserService";
import { AddContactService } from "../services/AddContactService";
import { BlockContactService } from "../services/BlockContactService";
import { searchContactsRequestSchema } from "../types/contactsTypes";

export class ContactsControllers {
  constructor(
    private readonly searchUserService: SearchUserService,
    private readonly addContactService: AddContactService,
    private readonly blockContactService: BlockContactService,
  ) {}

  searchContactController = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await this.searchUserService.execute({
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

  addContactController = async (req: Request, res: Response, next: NextFunction) => {
    const { contactId } = req.body;

    if (!contactId || !req.user) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const serviceResult = await this.addContactService.execute({
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

  blockContactController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const blockedUser = req.body.blockedUserId;

    if (!userId || !blockedUser) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const serviceResult = await this.blockContactService.execute({
      user: userId,
      blockedUser,
    });

    if (!serviceResult.success) {
      return res.status(404).json({
        success: false,
        message: serviceResult.message,
        data: null,
      });
    }

    // The blocking client needs the blocked contact's id and the affected
    // rooms so it can remove them from local storage
    res.status(201).json({
      success: true,
      message: "Contact blocked successfully",
      data: {
        blockedContactId: blockedUser,
        updatedRooms: serviceResult.data.rooms,
      },
    });
  };
}
