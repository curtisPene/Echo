import { socket } from "@/lib/socket";
import { parseOrReportError } from "@/lib/parseOrReportError";
import { onMessageReceivePayloadSchema, type MessageSendPayload } from "../types";
import type { MessagingSocketApi } from "../ports/MessagingSocketApi";

export class SocketIOMessagingSocketApi implements MessagingSocketApi {
  async sendMessage(payload: MessageSendPayload) {
    const response = await socket.emitWithAck("message:send", payload);
    return parseOrReportError(onMessageReceivePayloadSchema, response);
  }
}
