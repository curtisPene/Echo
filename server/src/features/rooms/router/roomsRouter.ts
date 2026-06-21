import express, { NextFunction, Request, Response } from "express";
import { createRoom } from "../repo/mongooseRoomRepo";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { participants, name } = req.body;

  const room = await createRoom({ participants, name });

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room,
  });
});

export default router;
