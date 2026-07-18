import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import { onMessageSendController } from "../controllers/socketControllers";

export const registerMessagingSocketHandlers = (io: Server, socket: AuthSocket) => {
  socket.on("message:send", (payload, ack) => {
    onMessageSendController({ socket, payload, ack });
  });
};
