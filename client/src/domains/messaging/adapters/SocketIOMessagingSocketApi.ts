import { socket } from "@/lib/socket";
import { parseOrThrow } from "@/lib/parseOrThrow";
import {
  onMessageReceivePayloadSchema,
  type MessageSendPayload,
  type MessageDeliveredPayload,
  type MessageReadPayload,
} from "../types";
import { Message } from "../entities/message";
import type { ServiceResult } from "@/types";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";

function toHydratedResult(
  data: unknown,
): ServiceResult<{ message: Message }> {
  const parsed = parseOrThrow(onMessageReceivePayloadSchema, data);

  if (!parsed.success || !parsed.data) {
    return { success: false, message: parsed.message, data: null };
  }

  return {
    success: true,
    message: parsed.message,
    data: { message: Message.hydrate(parsed.data.message) },
  };
}

export class SocketIOMessagingSocketApi implements MessagingSocketApi {
  async sendMessage(payload: MessageSendPayload) {
    const response = await socket.emitWithAck("message:send", payload);
    return toHydratedResult(response);
  }

  async confirmDelivery(payload: MessageDeliveredPayload) {
    const response = await socket.emitWithAck("message:delivered", payload);
    return toHydratedResult(response);
  }

  async confirmRead(payload: MessageReadPayload) {
    const response = await socket.emitWithAck("message:read", payload);
    return toHydratedResult(response);
  }
}
