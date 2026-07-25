import { ServiceResult } from "../../../types";
import { RepoError } from "../../../errors/RepoError";
import { DomainError } from "../../../errors/DomainError";
import { RoomDTO } from "../entities/room";
import { RoomRepository } from "../ports/RoomRepository";
import { AuthAndAccessSocket } from "../../authAndAccess/ports/AuthAndAccessSocket";
import { IdentityDTO } from "../../authAndAccess/domainModels/identity";

export class RenameRoomService {
  constructor(
    private readonly roomRepo: RoomRepository,
    private readonly socket: AuthAndAccessSocket,
  ) {}

  async execute({
    user,
    roomId,
    name,
  }: {
    user: IdentityDTO;
    roomId: string;
    name: string;
  }): Promise<ServiceResult<RoomDTO>> {
    try {
      const room = await this.roomRepo.findById({ roomId });

      if (!room) {
        return { success: false, message: "Room not found", data: null };
      }

      if (!room.hasParticipant(user.id)) {
        return { success: false, message: "Not a participant of this room", data: null };
      }

      const updated = room.rename(name);
      const saved = await this.roomRepo.update(updated);
      const roomView = saved.toDTO();

      const recipients = roomView.participants.filter(
        (participant) => participant.userId !== user.id,
      );

      await Promise.all(
        recipients.map((participant) =>
          this.socket.emitToUser({
            userId: participant.userId,
            event: "room:updated",
            payload: { room: roomView },
          }),
        ),
      );

      return {
        success: true,
        message: "Room renamed successfully",
        data: roomView,
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
