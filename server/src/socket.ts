import "dotenv/config";
import type { Server as HttpServer } from "node:http";
import { DefaultEventsMap, Server, Socket } from "socket.io";
import { onConnectionController } from "./domains/authAndAccess/controllers/authSocketControllers";
import { onMessageSendController } from "./domains/messaging/controllers/socketControllers";

export let io: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

interface SocketData {
  userId: string;
}

export type AuthSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;
export const attachSocket = (server: HttpServer) => {
  io = new Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    SocketData
  >(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.on("connection", (socket) => {
    onConnectionController(socket);

    socket.on("message:send", (payload, ack) => {
      if (!socket.data.userId) {
        return ack({ success: false, message: "Unauthorized", data: null });
      }
      onMessageSendController({ socket, payload, ack });
    });

    socket.on("contact:request", (payload) => {
      console.log(payload);
    });
  });

  return io;
};
