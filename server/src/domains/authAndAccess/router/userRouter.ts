import express from "express";
import type { UserControllers } from "../controllers/httpUserControllers";

export const createUserRouter = (controllers: UserControllers) => {
  const router = express.Router();

  router.get("/sync", controllers.syncUserDataController);

  router.post("/delete-account", controllers.deleteAccountController);

  return router;
};
