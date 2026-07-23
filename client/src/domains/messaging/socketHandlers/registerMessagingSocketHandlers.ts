import type { MessagingSocketControllers } from "../controllers/MessagingSocketControllers";
import type { Socket } from "@/lib/socket";

export const registerMessagingSocketHandlers = (
  socket: Socket,
  messagingControllers: MessagingSocketControllers,
) => {
  socket.on("message:receive", messagingControllers.onMessageReceive);

  return () =>
    socket.off("message:receive", messagingControllers.onMessageReceive);
};
