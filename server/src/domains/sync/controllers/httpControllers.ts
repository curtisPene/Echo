import { Request, Response } from "express";
import { SyncUserDataService } from "../services/SyncUserDataService";
import { sinceSchema } from "../types/syncTypes";

export class SyncControllers {
  constructor(private readonly syncUserDataService: SyncUserDataService) {}

  syncUserDataController = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const since =
      typeof req.query.since === "string" ? req.query.since : undefined;
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
}
