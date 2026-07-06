import express, { NextFunction, Request, Response } from "express";
import { createRoom } from "../repo/mongooseRoomRepo";
import { roomPresenter } from "../presenters/roomsPresenter";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const { participants, name } = req.body;

  const userId = req.user?.id;

  const roomDoc = await createRoom({
    participants: [
      ...participants.map((id: string) => ({ user: id })),
      { user: userId },
    ],
    name,
  });

  const roomView = roomPresenter({
    room: roomDoc,
    unread: 0,
    lastMessage: null,
  });

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: roomView,
  });
});

export default router;
