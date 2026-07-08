import { Room, RoomParticipant } from "../models/roomModel";
import { User } from "../../users/models/userModel";

export interface RoomWithPopulatedParticipants extends Omit<
  Room,
  "participants"
> {
  participants: (Omit<RoomParticipant, "user"> & { user: User })[];
}

// Input shape for creating a room - participant ids are plain strings here;
// Mongoose casts them to ObjectId at write time.
export type NewRoomParticipant = Omit<RoomParticipant, "user"> & {
  user: string;
};

export async function findRoomsWithUserId({
  userId,
  since,
}: {
  userId: string;
  since?: Date;
}): Promise<RoomWithPopulatedParticipants[]> {
  const roomsDocs = await Room.find({
    participants: { $elemMatch: { user: userId } },
    ...(since ? { updatedAt: { $gt: since } } : {}),
  }).populate<{
    participants: (Omit<RoomParticipant, "user"> & { user: User })[];
  }>("participants.user");

  return roomsDocs;
}

export async function updateParticipant({
  roomId,
  userId,
  status,
  lastReadAt,
}: {
  roomId: string;
  userId: string;
  status?: "pending" | "accepted";
  lastReadAt?: Date | null;
}): Promise<RoomWithPopulatedParticipants | null> {
  const setFields: Record<string, unknown> = {};

  if (status) setFields["participants.$.status"] = status;
  if (lastReadAt) setFields["participants.$.lastReadAt"] = lastReadAt;

  const updatedRoomDoc = await Room.findOneAndUpdate(
    { _id: roomId, "participants.user": userId },
    { $set: setFields },
    { new: true },
  ).populate<{
    participants: (Omit<RoomParticipant, "user"> & { user: User })[];
  }>("participants.user");

  if (!updatedRoomDoc) return null;

  return updatedRoomDoc.toObject() as unknown as RoomWithPopulatedParticipants;
}

export async function createRoom({
  participants,
  name,
}: {
  participants: NewRoomParticipant[];
  name: string;
}): Promise<RoomWithPopulatedParticipants> {
  const room = await Room.create({ participants, name });
  await room.populate("participants.user");

  return room.toObject() as unknown as RoomWithPopulatedParticipants;
}
