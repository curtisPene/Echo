import { NextFunction, Request, Response } from "express";
import { updateParticipantService } from "../services/updateParticipantService";
import { createNewRoomService } from "../services/createNewRoomService";
import { roomPresenter } from "../presenters/roomsPresenter";

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

  const serviceResult = await createNewRoomService({
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
  const roomView = roomPresenter({
    room: serviceResult.data,
    unread: 0,
    lastMessage: null,
  });

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: roomView,
  });
};

export const updateParticipantController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { roomId, status, lastReadAt } = req.body;
  const user = req.user;

  if (!roomId || !user) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  if (!status && !lastReadAt) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields (Status or lastReadAt must be provided)",
      data: null,
    });
  }

  const serviceResult = await updateParticipantService({
    userId: user.id,
    status,
    lastReadAt,
    roomId,
  });

  if (!serviceResult.success) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message,
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    message: "Contact updated successfully",
    data: serviceResult.data,
  });
};
