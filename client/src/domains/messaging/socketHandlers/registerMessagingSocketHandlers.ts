import { parseOrReportError } from "@/lib/parseOrReportError";
import { onMessageReceivePayloadSchema } from "../types";
import type { MessagingControllers } from "../controllers/MessagingControllers";
import type { Socket } from "@/lib/socket";

export const registerMessagingSocketHandlers = (
  socket: Socket,
  messagingControllers: MessagingControllers,
) => {
  const onMessageReceive = (payload: unknown) => {
    const parsed = parseOrReportError(onMessageReceivePayloadSchema, payload);

    if (!parsed.success) return;

    messagingControllers.onMessageReceive({ message: parsed.data.message });
  };

  socket.on("message:receive", onMessageReceive);

  return () => socket.off("message:receive", onMessageReceive);
};
