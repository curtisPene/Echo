import { SendMessageService } from "../services/sendMessageService";
import { MessageReceiveService } from "../services/messageReceiveService";
import { onMessageReceivePayloadSchema } from "../types";
import { parseOrReportError } from "@/lib/parseOrReportError";

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

  onMessageReceive = async (payload: unknown) => {
    const parsed = parseOrReportError(onMessageReceivePayloadSchema, payload);

    if (!parsed.success) return;

    await this.messageReceiveService.execute({ message: parsed.data.message });
  };
}
