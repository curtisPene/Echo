import { Room, RoomParticipant } from "../models/roomModel";

export async function findRoomsWithUserId({
  userId,
  since,
}: {
  userId: string;
  since?: string;
}): Promise<Room[]> {
  const sinceDate = since ? new Date(since) : undefined;
  const roomsDocs = await Room.find({
    participants: { $elemMatch: { user: userId } },
    ...(sinceDate ? { updatedAt: { $gt: sinceDate } } : {}),
  });

  return roomsDocs;
}

export async function createRoom({
  participants,
  name,
}: {
  participants: RoomParticipant[];
  name?: string;
}): Promise<Room> {
  const room = await Room.create({ participants, name });

  return room;
}
