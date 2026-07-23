import { MessageRepo } from "../repo/mongooseMessageRepo";
import { RoomRepository } from "../../conversations/ports/RoomRepository";
import { MessageDTO } from "../entities/message";
import { RepoError } from "../../../errors/RepoError";
import { ServiceResult } from "../../../types";

export class MessageStatusUpdateService {
  constructor(
    private readonly messageRepo: MessageRepo,
    private readonly roomRepo: RoomRepository,
  ) {}

  async execute({
    messageId,
    userId,
    kind,
  }: {
    messageId: string;
    userId: string;
    kind: "delivered" | "read";
  }): Promise<ServiceResult<{ message: MessageDTO }>> {
    try {
      const message = await this.messageRepo.findById({ messageId });

      if (!message) {
        return { success: false, message: "Message not found", data: null };
      }

      const room = await this.roomRepo.findById({ roomId: message.roomId });

      if (!room) {
        return { success: false, message: "Room not found", data: null };
      }

      const roomDTO = room.toDTO();
      const updatedMessage =
        kind === "delivered"
          ? message.markDelivered(roomDTO, userId)
          : message.markRead(roomDTO, userId);
      await this.messageRepo.update(updatedMessage);

      return {
        success: true,
        message: `Message marked ${kind} successfully`,
        data: { message: updatedMessage.toDTO(roomDTO) },
      };
    } catch (error) {
      if (error instanceof RepoError) {
        console.error("[Repo]", error.message);
      } else {
        console.error(error);
      }
      return { success: false, message: "Internal server error", data: null };
    }
  }
}
