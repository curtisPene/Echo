import express from "express";
import { syncUserDataService } from "../services/syncUserDataService";
import { sinceSchema } from "../types/usersTypes";

const router = express.Router();

router.get("/sync", async (req, res) => {
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

  const result = await syncUserDataService({
    userId,
    since: parsedSince.data,
  });

  if (!result.success) {
    return res.status(500).json(result);
  }

  return res.status(200).json(result);

  // since absent -> full/cold bootstrap sync, since present -> delta sync
});

export default router;
