import express from "express";
import {
  createNewRoomController,
  acceptRoomInviteController,
} from "../controllers/httpControllers";

const router = express.Router();

router.post("/", createNewRoomController);

router.post("/accept-invite", acceptRoomInviteController);

export default router;
