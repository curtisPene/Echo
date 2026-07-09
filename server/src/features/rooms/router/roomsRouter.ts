import express, { NextFunction, Request, Response } from "express";
import { roomPresenter } from "../presenters/roomsPresenter";
import { createNewRoomService } from "../services/createNewRoomService";
import {
  createNewRoomController,
  updateParticipantController,
} from "../controllers/httpControllers";

const router = express.Router();

router.post("/", createNewRoomController);

router.post("/update-participant", updateParticipantController);

export default router;
