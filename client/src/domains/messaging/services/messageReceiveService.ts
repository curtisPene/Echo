import type { MessageDTO } from "../entities/message";
import type { MessagesRepository } from "../ports/MessagesRepository";
import type { ServiceResult } from "@/types";
import { DomainError } from "@/errors/DomainError";
import { RepoError } from "@/errors/RepoError";
import { HttpError } from "@/errors/HttpError";

export class MessageReceiveService {
  private readonly messagesRepo: MessagesRepository;

  constructor(messagesRepo: MessagesRepository) {
    this.messagesRepo = messagesRepo;
  }

  async execute({ message }: { message: MessageDTO }): Promise<ServiceResult<null>> {
    // Room status (pending/accepted) is a display-only concern handled by
    // useConversationListViewModel - a message is always saved regardless
    // of the room's status for the current user.
    try {
      await this.messagesRepo.saveMessage(message);

      return { success: true, message: "Message saved successfully", data: null };
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
