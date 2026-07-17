import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { DomainError } from "../../../errors/DomainError";
import { RoomDTO } from "../domainModels/room";
import { RoomRepo } from "../repo/mongooseRoomRepo";

export const acceptRoomInviteService = async ({
  userId,
  roomId,
}: {
  userId: string;
  roomId: string;
}): Promise<ServiceResult<RoomDTO>> => {
  try {
    const room = await RoomRepo.findById({ roomId });

    if (!room) {
      return { success: false, message: "Room not found", data: null };
    }

    const accepted = room.acceptParticipant(userId);
    const saved = await RoomRepo.update(accepted);

    return {
      success: true,
      message: "Participant updated successfully",
      data: saved.toDTO(),
    };
  } catch (error) {
    if (error instanceof DomainError) {
      return { success: false, message: error.message, data: null };
    }

    if (error instanceof RepoError) {
      console.error("[Repo]", error.message);
    } else {
      console.error(error);
    }
    return { success: false, message: "Internal server error", data: null };
  }
};
