import { socket } from "@/lib/socket";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { onMessageReceivePayloadSchema, type MessageSendPayload } from "../types";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";

export class SocketIOMessagingSocketApi implements MessagingSocketApi {
  async sendMessage(payload: MessageSendPayload) {
    const response = await socket.emitWithAck("message:send", payload);
    return parseOrThrow(onMessageReceivePayloadSchema, response);
  }
}
