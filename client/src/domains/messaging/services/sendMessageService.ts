import type { ServiceResult } from "@/types";
import { type MessageDTO } from "../entities/message";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";
import type { MessagesRepository } from "../ports/MessagesRepository";
import type { User } from "@/domains/authAndAccess/entities/user";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

function createTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class SendMessageService {
  private readonly messagingSocketApi: MessagingSocketApi;
  private readonly messagesRepo: MessagesRepository;

  constructor(
    messagingSocketApi: MessagingSocketApi,
    messagesRepo: MessagesRepository,
  ) {
    this.messagingSocketApi = messagingSocketApi;
    this.messagesRepo = messagesRepo;
  }

  async execute({
    text,
    roomId,
    sender,
  }: {
    text: string;
    roomId: string;
    sender: User;
  }): Promise<ServiceResult<MessageDTO>> {
    const tempId = createTempId();
    const optimisticMessage: MessageDTO = {
      id: tempId,
      roomId,
      redacted: false,
      sender: {
        userId: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
      },
      text,
      createdAt: new Date().toISOString(),
      reactions: [],
      readBy: [],
      deliveredTo: [],
      deliveryStatus: "sending",
    };

    await this.messagesRepo.saveMessage(optimisticMessage);

    try {
      const response = await this.messagingSocketApi.sendMessage({
        text,
        roomId,
      });

      if (!response.success || !response.data) {
        await this.messagesRepo.saveMessage({
          ...optimisticMessage,
          deliveryStatus: "failed",
        });

        return {
          success: false,
          message: response.message,
          data: null,
        };
      }

      const messageDTO = response.data.message.toDTO();

      await this.messagesRepo.deleteMessage(tempId);
      await this.messagesRepo.saveMessage(messageDTO);

      return {
        success: true,
        message: "Message sent successfully",
        data: messageDTO,
      };
    } catch (error) {
      await this.messagesRepo.saveMessage({
        ...optimisticMessage,
        deliveryStatus: "failed",
      });

      if (
        error instanceof DomainError ||
        error instanceof RepoError ||
        error instanceof HttpError
      ) {
        return { success: false, message: error.message, data: null };
      }

      return {
        success: false,
        message: "An unexpected error occurred",
        data: null,
      };
    }
  }
}
