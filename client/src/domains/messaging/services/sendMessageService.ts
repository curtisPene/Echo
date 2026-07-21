import type { ServiceResult } from "@/types";
import type { MessageDTO } from "../entities/message";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";
import type { MessagesRepository } from "../ports/MessagesRepository";

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
  }: {
    text: string;
    roomId: string;
  }): Promise<ServiceResult<MessageDTO>> {
    const response = await this.messagingSocketApi.sendMessage({ text, roomId });

    if (!response.success) {
      return {
        success: false,
        message: response.message,
        data: null,
      };
    }

    await this.messagesRepo.saveMessage(response.data.message);

    return {
      success: true,
      message: "Message sent successfully",
      data: response.data.message,
    };
  }
}
