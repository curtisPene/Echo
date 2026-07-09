import express from "express";
import {
  createNewRoomController,
  updateParticipantController,
} from "../controllers/httpControllers";

const router = express.Router();

router.post("/", createNewRoomController);

router.post("/update-participant", updateParticipantController);

export default router;
