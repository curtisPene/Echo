import type { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import {
  onConnection,
  onMessage,
} from "./features/auth/controllers/authSocketControllers";

export let io: Server;

export const attachSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  io.on("connection", (socket: Socket) => {
    onConnection(socket);
    onMessage(socket);
  });

  return io;
};
