import { NextFunction, Request, Response } from "express";
import { searchUserService } from "../composition";
import { searchContactsRequestSchema } from "../types/contactsTypes";
import { addContactService } from "../services/addContactService";
import { blockContactService } from "../services/blockContactService";
import { io } from "../../../socket";

export const searchContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;

  if (!email || !req.user) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: null,
    });
  }

  const parsed = searchContactsRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      data: null,
    });
  }

  const result = await searchUserService.execute({
    ...parsed.data,
    viewerId: req.user.id,
  });

  if (!result.success) {
    return res.status(404).json({
      success: false,
      message: result.message,
      data: null,
    });
  }

  res.status(201).json({
    success: true,
    message: result.message,
    data: result.data.user,
  });
};

export const addContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { contactId } = req.body;

  if (!contactId || !req.user) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  const serviceResult = await addContactService({
    userId: req.user.id,
    contactId,
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
    message: "Contact added successfully",
    data: serviceResult.data.addedUser,
  });
};

export const blockContactController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;
  const blockedUser = req.body.blockedUserId;

  if (!userId || !blockedUser) {
    return res.status(400).json({
      success: false,
      message: "Missing request fields",
      data: null,
    });
  }

  const serviceResult = await blockContactService({
    user: userId,
    blockedUser,
  });

  if (!serviceResult.success) {
    return res.status(404).json({
      success: false,
      message: serviceResult.message,
      data: null,
    });
  }
  const { rooms, affectedParticipantIds } = serviceResult.data;

  // The blocker is the one removed from every affected room (1:1 deleted, or
  // pulled from group participants) - their sockets always need to leave. The
  // blocked user is only removed from the room in the 1:1 case (room deleted
  // entirely); in a group chat the blocked user stays a participant, so their
  // sockets stay joined.
  const blockersSockets = await io.in(`user:${userId}`).fetchSockets();
  const blockedUserSockets = await io.in(`user:${blockedUser}`).fetchSockets();

  rooms.forEach((room) => {
    blockersSockets.forEach((socket) => socket.leave(room.roomId));

    if (!("room" in room)) {
      blockedUserSockets.forEach((socket) => socket.leave(room.roomId));
    }
  });

  // Notify every remaining group member (already deduplicated by the service)
  // so their client re-syncs the affected rooms without receiving the event
  // more than once, even if they share multiple group rooms with the blocker.
  // 1:1 rooms are deleted (no RoomDTO left to send, just the id to remove
  // locally); group rooms still exist with the blocker removed, so they get
  // a normal room:updated with the fresh RoomDTO.
  affectedParticipantIds.forEach((participantId) => {
    rooms.forEach((room) => {
      if (!("room" in room)) {
        io.to(`user:${participantId}`).emit("room:deleted", {
          roomId: room.roomId,
        });
      } else {
        io.to(`user:${participantId}`).emit("room:updated", {
          room: room.room,
        });
      }
    });
  });

  // The blocking client needs the blocked contact's id and the affected
  // rooms so it can remove them from local storage
  res.status(201).json({
    success: true,
    message: "Contact blocked successfully",
    data: {
      blockedContactId: blockedUser,
      updatedRooms: rooms,
    },
  });
};
