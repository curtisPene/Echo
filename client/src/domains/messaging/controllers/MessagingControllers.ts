import { SendMessageService } from "../services/sendMessageService";
import { MessageReceiveService } from "../services/messageReceiveService";
import { onMessageReceivePayloadSchema } from "../types";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { HttpError } from "@/errors/HttpError";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";

export type SendMessageResult =
  | { success: true }
  | { success: false; message: string };

export class MessagingControllers {
  private readonly sendMessageService: SendMessageService;
  private readonly messageReceiveService: MessageReceiveService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    sendMessageService: SendMessageService,
    messageReceiveService: MessageReceiveService,
    notificationsPort: NotificationsPort,
  ) {
    this.sendMessageService = sendMessageService;
    this.messageReceiveService = messageReceiveService;
    this.notificationsPort = notificationsPort;
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
      this.notificationsPort.notify(result.message, "error");
      return { success: false, message: result.message };
    }

    return { success: true };
  };

  onMessageReceive = async (payload: unknown) => {
    let parsed;
    try {
      parsed = parseOrThrow(onMessageReceivePayloadSchema, payload);
    } catch (error) {
      if (error instanceof HttpError) {
        console.error("Ignoring malformed message:receive payload", error);
        return;
      }
      throw error;
    }

    if (!parsed.success) return;

    await this.messageReceiveService.execute({ message: parsed.data.message });
  };
}
