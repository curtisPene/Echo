import { ServiceResult } from "../../../types";
import { Room } from "../models/roomModel";
import {
  RoomWithPopulatedParticipants,
  updateParticipant,
} from "../repo/mongooseRoomRepo";

export const updateParticipantService = async ({
  userId,
  status,
  lastReadAt,
  roomId,
}: {
  userId: string;
  status?: "pending" | "accepted";
  lastReadAt?: Date | null;
  roomId: string;
}): Promise<ServiceResult<RoomWithPopulatedParticipants>> => {
  const updateRoomParticipant = await updateParticipant({
    userId,
    status,
    lastReadAt,
    roomId,
  });

  if (!updateRoomParticipant) {
    return { success: false, message: "Participant not updated", data: null };
  }

  return {
    success: true,
    message: "Participant updated successfully",
    data: updateRoomParticipant,
  };
};
