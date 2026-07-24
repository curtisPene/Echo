import type { ServiceResult } from "@/types";
import type { MessageDTO } from "../entities/message";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";
import type { MessagesRepository } from "../ports/MessagesRepository";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class ConfirmMessageReadService {
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
    messageId,
  }: {
    messageId: string;
  }): Promise<ServiceResult<MessageDTO>> {
    try {
      const response = await this.messagingSocketApi.confirmRead({
        messageId,
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message,
          data: null,
        };
      }

      const messageDTO = response.data.message.toDTO();

      await this.messagesRepo.saveMessage(messageDTO);

      return {
        success: true,
        message: "Read confirmed successfully",
        data: messageDTO,
      };
    } catch (error) {
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
