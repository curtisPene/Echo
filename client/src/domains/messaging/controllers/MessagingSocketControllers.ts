import { SendMessageService } from "../services/sendMessageService";
import { MessageReceiveService } from "../services/messageReceiveService";
import { ConfirmMessageDeliveryService } from "../services/confirmMessageDeliveryService";
import { ConfirmMessageReadService } from "../services/confirmMessageReadService";
import { onMessageReceivePayloadSchema } from "../types";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { HttpError } from "@/errors/HttpError";
import { useAuth } from "@/stores/useAuth";
import { useSocketState } from "@/stores/useSocket";
import type { NotificationsPort } from "@/infrastructure/notifications/ShadSonnerAdapter";
import type { ServiceResult } from "@/types";
import type { MessageDTO } from "../entities/message";

export type SendMessageResult =
  { success: true } | { success: false; message: string };

export class MessagingSocketControllers {
  private readonly sendMessageService: SendMessageService;
  private readonly messageReceiveService: MessageReceiveService;
  private readonly confirmMessageDeliveryService: ConfirmMessageDeliveryService;
  private readonly confirmMessageReadService: ConfirmMessageReadService;
  private readonly notificationsPort: NotificationsPort;

  constructor(
    sendMessageService: SendMessageService,
    messageReceiveService: MessageReceiveService,
    confirmMessageDeliveryService: ConfirmMessageDeliveryService,
    confirmMessageReadService: ConfirmMessageReadService,
    notificationsPort: NotificationsPort,
  ) {
    this.sendMessageService = sendMessageService;
    this.messageReceiveService = messageReceiveService;
    this.confirmMessageDeliveryService = confirmMessageDeliveryService;
    this.confirmMessageReadService = confirmMessageReadService;
    this.notificationsPort = notificationsPort;
  }

  sendMessage = async ({
    text,
    roomId,
  }: {
    text: string;
    roomId: string;
  }): Promise<SendMessageResult> => {
    const auth = useAuth.getState();

    if (
      auth.authStatus !== "authenticated" ||
      useSocketState.getState().onlineStatus !== "online"
    ) {
      const message = "Unable to send message right now";
      this.notificationsPort.notify(message, "error");
      return { success: false, message };
    }

    const result = await this.sendMessageService.execute({
      text,
      roomId,
      sender: auth.user,
    });

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

    const { message } = parsed.data;
    await this.messageReceiveService.execute({ message });

    // Confirm delivery unless this user has already confirmed it (from this
    // device or any other - deliveredTo is keyed by userId, not per-device,
    // so a second device receiving the same broadcast still needs to
    // confirm on its own if it hasn't already). Checking deliveredTo instead
    // of "am I the sender" is what makes this correct for the sender's OWN
    // other devices too - the sender's own confirmations are filtered out
    // of the server's delivered-status derivation anyway, so calling this
    // for a sender's own device is harmless even though it's a no-op for
    // status purposes.
    const auth = useAuth.getState();
    const alreadyConfirmed =
      auth.authStatus === "authenticated" &&
      message.deliveredTo.includes(auth.user.id);

    if (!message.redacted && !alreadyConfirmed) {
      await this.confirmMessageDeliveryService.execute({
        messageId: message.id,
      });
    }
  };

  /**
   * Marks a message read. Unlike delivery (auto-confirmed the instant
   * message:receive lands), there's no auto-trigger here - "when" a message
   * counts as read is a UI/UX decision (on screen? conversation open? an
   * explicit action?) that hasn't been made yet, since the UI itself isn't
   * built. This method is the framework-agnostic entry point whatever UI
   * signal eventually calls into - the app core doesn't need to know what
   * that signal is.
   */
  markRead = async ({
    messageId,
  }: {
    messageId: string;
  }): Promise<ServiceResult<MessageDTO>> => {
    const result = await this.confirmMessageReadService.execute({
      messageId,
    });

    if (!result.success) {
      this.notificationsPort.notify(result.message, "error");
    }

    return result;
  };
}
