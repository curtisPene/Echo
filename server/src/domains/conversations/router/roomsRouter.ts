import express from "express";
import type { RoomsControllers } from "../controllers/httpControllers";

export const createRoomsRouter = (controllers: RoomsControllers) => {
  const router = express.Router();

  router.post("/", controllers.createNewRoomController);

  router.post("/accept-invite", controllers.acceptRoomInviteController);

  router.post("/participants", controllers.addParticipantController);

  router.post("/rename", controllers.renameRoomController);

  return router;
};
