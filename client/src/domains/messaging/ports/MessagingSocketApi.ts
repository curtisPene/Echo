import type { MessageReceivePayload, MessageSendPayload } from "../types";

export interface MessagingSocketApi {
  sendMessage(payload: MessageSendPayload): Promise<MessageReceivePayload>;
}
