import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import type { MessagingControllers } from "../controllers/socketControllers";

export const registerMessagingSocketHandlers = (
  io: Server,
  socket: AuthSocket,
  controllers: MessagingControllers,
) => {
  socket.on("message:send", (payload, ack) => {
    controllers.onMessageSendController({ socket, payload, ack });
  });
};
