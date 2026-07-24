import type {
  MessageSendPayload,
  MessageDeliveredPayload,
  MessageReadPayload,
} from "../types";
import type { ServiceResult } from "@/types";
import type { Message } from "../entities/message";

export interface MessagingSocketApi {
  sendMessage(
    payload: MessageSendPayload,
  ): Promise<ServiceResult<{ message: Message }>>;
  confirmDelivery(
    payload: MessageDeliveredPayload,
  ): Promise<ServiceResult<{ message: Message }>>;
  confirmRead(
    payload: MessageReadPayload,
  ): Promise<ServiceResult<{ message: Message }>>;
}
