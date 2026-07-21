import express from "express";
import type { SyncControllers } from "../controllers/httpControllers";

export const createSyncRouter = (controllers: SyncControllers) => {
  const router = express.Router();

  router.get("/user", controllers.syncUserDataController);

  return router;
};
