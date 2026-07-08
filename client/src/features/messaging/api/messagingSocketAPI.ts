import { socket } from "@/lib/socket";
import { parseOrReportError } from "@/lib/parseOrReportError";
import {
  onMessageReceivePayloadSchema,
  type MessageSendPayload,
} from "../types";

export const sendMessageSocket = async ({
  payload,
}: {
  payload: MessageSendPayload;
}) => {
  const response = await socket.emitWithAck("message:send", payload);

  return parseOrReportError(onMessageReceivePayloadSchema, response);
};
