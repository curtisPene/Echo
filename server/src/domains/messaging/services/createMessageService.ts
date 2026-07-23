import mongoose from "mongoose";
import { ServiceResult } from "../../../types";
import { MessageDTO, NewMessage, SenderEntity } from "../entities/message";
import { MessageRepo } from "../repo/mongooseMessageRepo";
import { MessagingSocket } from "../ports/MessagingSocket";

export class CreateMessageService {
  constructor(
    private readonly messageRepo: MessageRepo,
    private readonly messagingSocket: MessagingSocket,
  ) {}

  async execute({
    sender,
    newMessage,
  }: {
    sender: SenderEntity;
    newMessage: Omit<NewMessage, "sender">;
  }): Promise<ServiceResult<{ message: MessageDTO }>> {
    try {
      const createdMessage = await this.messageRepo.create({
        ...newMessage,
        sender,
      });

      const result: ServiceResult<{ message: MessageDTO }> = {
        success: true,
        message: "Message created successfully",
        data: {
          message: createdMessage.toDTO(),
        },
      };

      await this.messagingSocket.emitToRoom({
        roomId: newMessage.roomId,
        event: "message:receive",
        payload: result,
      });

      return result;
    } catch (error) {
      if (error instanceof mongoose.Error) {
        return {
          success: false,
          message: "Invalid request data",
          data: null,
        };
      }
      return {
        success: false,
        message: "Internal Server Error",
        data: null,
      };
    }
  }
}
