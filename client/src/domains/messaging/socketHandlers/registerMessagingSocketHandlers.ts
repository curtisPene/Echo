import type { MessagingControllers } from "../controllers/MessagingControllers";
import type { Socket } from "@/lib/socket";

export const registerMessagingSocketHandlers = (
  socket: Socket,
  messagingControllers: MessagingControllers,
) => {
  socket.on("message:receive", messagingControllers.onMessageReceive);

  return () =>
    socket.off("message:receive", messagingControllers.onMessageReceive);
};
