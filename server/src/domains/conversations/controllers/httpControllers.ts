import { NextFunction, Request, Response } from "express";
import { CreateNewRoomService } from "../services/createNewRoomService";
import { UpdateRoomInviteService } from "../services/UpdateRoomInviteService";
import {
  createNewRoomRequestSchema,
  acceptRoomInviteRequestSchema,
} from "../types/roomsTypes";

export class RoomsControllers {
  constructor(
    private readonly createNewRoomService: CreateNewRoomService,
    private readonly updateRoomInviteService: UpdateRoomInviteService,
  ) {}

  createNewRoomController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const parsed = createNewRoomRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const serviceResult = await this.createNewRoomService.execute({
      user: req.user,
      participants: parsed.data.participants,
      name: parsed.data.name,
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

  acceptRoomInviteController = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "Missing request fields",
        data: null,
      });
    }

    const parsed = acceptRoomInviteRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        data: null,
      });
    }

    const serviceResult = await this.updateRoomInviteService.execute({
      user: req.user,
      roomId: parsed.data.roomId,
      isAcceptRequest: parsed.data.isAcceptRequest,
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
      message: serviceResult.message,
      data: serviceResult.data,
    });
  };
}
