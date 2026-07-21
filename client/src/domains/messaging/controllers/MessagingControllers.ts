import { SendMessageService } from "../services/sendMessageService";
import { MessageReceiveService } from "../services/messageReceiveService";
import type { MessageDTO } from "../domainModels/message";

export type SendMessageResult =
  | { success: true }
  | { success: false; message: string };

export class MessagingControllers {
  private readonly sendMessageService: SendMessageService;
  private readonly messageReceiveService: MessageReceiveService;

  constructor(
    sendMessageService: SendMessageService,
    messageReceiveService: MessageReceiveService,
  ) {
    this.sendMessageService = sendMessageService;
    this.messageReceiveService = messageReceiveService;
  }

  sendMessage = async ({
    text,
    roomId,
  }: {
    text: string;
    roomId: string;
  }): Promise<SendMessageResult> => {
    const result = await this.sendMessageService.execute({ text, roomId });

    if (!result.success) {
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  onMessageReceive = async ({ message }: { message: MessageDTO }) => {
    await this.messageReceiveService.execute({ message });
  };
}
