import express from "express";
import type { RoomsControllers } from "../controllers/httpControllers";

export const createRoomsRouter = (controllers: RoomsControllers) => {
  const router = express.Router();

  router.post("/", controllers.createNewRoomController);

  router.post("/accept-invite", controllers.acceptRoomInviteController);

  return router;
};
