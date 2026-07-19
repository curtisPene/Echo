import { NextFunction, Request, Response } from "express";
import { CreateNewRoomService } from "../services/createNewRoomService";
import { AcceptRoomInviteService } from "../services/AcceptRoomInviteService";

export class RoomsControllers {
  constructor(
    private readonly createNewRoomService: CreateNewRoomService,
    private readonly acceptRoomInviteService: AcceptRoomInviteService,
  ) {}

  createNewRoomController = async (req: Request, res: Response, next: NextFunction) => {
    const { participants, name } = req.body;
    const user = req.user;

    if (!participants || !name || !user) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const serviceResult = await this.createNewRoomService.execute({
      user,
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

  acceptRoomInviteController = async (req: Request, res: Response, next: NextFunction) => {
    const { roomId } = req.body;
    const user = req.user;

    if (!roomId || !user) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const serviceResult = await this.acceptRoomInviteService.execute({
      user,
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
      message: "Room invite accepted successfully",
      data: serviceResult.data,
    });
  };
}
