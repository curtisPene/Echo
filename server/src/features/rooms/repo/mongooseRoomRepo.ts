import { Room, RoomParticipant } from "../models/roomModel";
import { User } from "../../users/models/userModel";

export interface RoomWithPopulatedParticipants extends Omit<
  Room,
  "participants"
> {
  participants: (Omit<RoomParticipant, "user"> & { user: User })[];
}

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

export async function createRoom({
  participants,
  name,
}: {
  participants: RoomParticipant[];
  name?: string;
}): Promise<RoomWithPopulatedParticipants> {
  const room = await Room.create({ participants, name });
  await room.populate("participants.user");

  return room.toObject() as unknown as RoomWithPopulatedParticipants;
}
