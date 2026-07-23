import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { DomainError } from "../../../errors/DomainError";
import { RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";

export class RemoveParticipantFromRoomService {
  constructor(private readonly roomRepo: RoomRepository) {}

  async execute({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<ServiceResult<RoomDTO | null>> {
    try {
      const room = await this.roomRepo.findById({ roomId });

      if (!room) {
        return { success: false, message: "Room not found", data: null };
      }

      const updated = room.removeParticipant(userId);
      const saved = await this.roomRepo.update(updated);

      return {
        success: true,
        message: "Participant removed successfully",
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
  }
}
