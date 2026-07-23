import type { OnMessageSendPayload } from "./types";
import type { MessageDTO } from "./entities/message";
import type { ServiceResult } from "../../types";

export const MessageEvents = {
  SEND: "message:send",
  RECEIVE: "message:receive",
} as const;

export interface MessagingClientToServerEvents {
  [MessageEvents.SEND]: (
    payload: OnMessageSendPayload,
    ack: (response: ServiceResult<{ message: MessageDTO }>) => void,
  ) => void;
}

export interface MessagingServerToClientEvents {
  [MessageEvents.RECEIVE]: (
    response: ServiceResult<{ message: MessageDTO }>,
  ) => void;
}
