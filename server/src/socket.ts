import type { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { onConnectionController } from "./features/auth/controllers/authSocketControllers";
import { onMessageSendController } from "./features/rooms/controllers/socketControllers";

export let io: Server;

type AuthSocket = Socket & {
  userId: string;
};

export const attachSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket: Socket) => {
    onConnectionController(socket);

    socket.on("message:send", (payload, ack) => {
      if (!socket.data.userId) {
        console.log("Unauthorized user attempted to send message: ", socket.id);
        return;
      }
      onMessageSendController({ socket, payload, ack });
    });
  });

  return io;
};
