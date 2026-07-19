import { NextFunction, Request, Response } from "express";
import { acceptRoomInviteService } from "../services/AcceptRoomInviteService";
import { createNewRoomService } from "../composition";
import { io } from "../../../socket";

export const createNewRoomController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { participants, name } = req.body;
  const userId = req.user?.id;

  if (!participants || !name || !userId) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  const serviceResult = await createNewRoomService.execute({
    user: userId,
    participants: participants,
    name: name,
  });

  if (!serviceResult.success) {
    return res.status(400).json({
      success: false,
      message: serviceResult.message,
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: serviceResult.data,
  });
};

export const acceptRoomInviteController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { roomId } = req.body;
  const user = req.user;

  if (!roomId || !user) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  const serviceResult = await acceptRoomInviteService({
    userId: user.id,
    roomId,
  });

  if (!serviceResult.success) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message,
      data: null,
    });
  }

  const roomView = serviceResult.data;

  const otherParticipants = roomView.participants.filter(
    (participant) => participant.userId !== user.id,
  );

  // Notify other participants of the update
  otherParticipants.forEach((participant) => {
    io.to(`user:${participant.userId}`).emit("room:updated", {
      room: roomView,
    });
  });

  res.status(201).json({
    success: true,
    message: "Room invite accepted successfully",
    data: roomView,
  });
};
