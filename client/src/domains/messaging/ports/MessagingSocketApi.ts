import type {
  MessageReceivePayload,
  MessageSendPayload,
  MessageDeliveredPayload,
  MessageReadPayload,
} from "../types";

export interface MessagingSocketApi {
  sendMessage(payload: MessageSendPayload): Promise<MessageReceivePayload>;
  confirmDelivery(
    payload: MessageDeliveredPayload,
  ): Promise<MessageReceivePayload>;
  confirmRead(payload: MessageReadPayload): Promise<MessageReceivePayload>;
}
