import { parseOrReportError } from "@/lib/parseOrReportError";
import { onMessageReceivePayloadSchema } from "../types";
import { messageReceiveService } from "../services/messageReceiveService";
import type { Socket } from "@/lib/socket";

export const registerMessagingSocketHandlers = (socket: Socket) => {
  const messageReceiveController = (payload: unknown) => {
    const parsed = parseOrReportError(onMessageReceivePayloadSchema, payload);

    if (!parsed.success) return;

    messageReceiveService({ message: parsed.data.message });
  };

  socket.on("message:receive", messageReceiveController);

  return () => socket.off("message:receive", messageReceiveController);
};
