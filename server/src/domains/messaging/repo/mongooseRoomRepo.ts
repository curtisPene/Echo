import { Room, RoomParticipant } from "../models/roomModel";
import { User } from "../../authAccess/mongooseModels/userModel";
import { RepoError } from "../../../errors/RepoError";

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

  return roomsDocs.map(
    (room) => room.toJSON() as unknown as RoomWithPopulatedParticipants,
  );
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

export async function updateRoomById({
  roomId,
  fields,
}: {
  roomId: string;
  fields: Partial<Omit<Room, "_id" | "participants">>;
}): Promise<RoomWithPopulatedParticipants | null> {
  const updatedRoomDoc = await Room.findOneAndUpdate(
    { _id: roomId },
    { $set: fields },
    { new: true },
  ).populate<{
    participants: (Omit<RoomParticipant, "user"> & { user: User })[];
  }>("participants.user");

  if (!updatedRoomDoc) return null;

  return updatedRoomDoc.toObject() as unknown as RoomWithPopulatedParticipants;
}

export async function deleteRoomById({
  roomId,
}: {
  roomId: string;
}): Promise<boolean> {
  const result = await Room.deleteOne({ _id: roomId });

  return result.deletedCount > 0;
}

export async function removeContactFromRoomById({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) {
  const updatedRoomDoc = await Room.findOneAndUpdate(
    { _id: roomId, "participants.user": userId },
    { $pull: { participants: { user: userId } } },
    { new: true },
  ).populate<{
    participants: (Omit<RoomParticipant, "user"> & { user: User })[];
  }>("participants.user");

  if (!updatedRoomDoc) throw new RepoError("Room not found for this user");

  return updatedRoomDoc.toObject() as unknown as RoomWithPopulatedParticipants;
}
