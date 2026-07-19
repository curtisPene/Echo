import { NextFunction, Request, Response } from "express";
import { SyncUserDataService } from "../services/SyncUserDataService";
import { DeleteUserAccountService } from "../services/DeleteUserAccountService";
import { sinceSchema } from "../types/usersTypes";

export class UserControllers {
  constructor(
    private readonly syncUserDataService: SyncUserDataService,
    private readonly deleteUserAccountService: DeleteUserAccountService,
  ) {}

  syncUserDataController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const since = typeof req.query.since === "string" ? req.query.since : undefined;
    const parsedSince = sinceSchema.safeParse(since);

    if (!userId || !parsedSince.success) {
      return res.status(400).json({
        success: false,
        message: "Malformed request",
        data: null,
      });
    }

    const result = await this.syncUserDataService.execute({
      userId,
      since: parsedSince.data,
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    return res.status(200).json(result);

    // since absent -> full/cold bootstrap sync, since present -> delta sync
  };

  deleteAccountController = async (req: Request, res: Response, next: NextFunction) => {
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
