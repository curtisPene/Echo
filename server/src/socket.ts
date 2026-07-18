import "dotenv/config";
import type { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./domains/authAndAccess/middleware/socketAuthMiddleware";
import { registerAuthSocketHandlers } from "./domains/authAndAccess/socketHandlers/registerAuthSocketHandlers";
import { registerMessagingSocketHandlers } from "./domains/messaging/socketHandlers/registerMessagingSocketHandlers";
import type { IdentityDTO } from "./domains/authAndAccess/domainModels/identity";
import type {
  MessagingClientToServerEvents,
  MessagingServerToClientEvents,
} from "./domains/messaging/socketEvents";
import type { ConversationsServerToClientEvents } from "./domains/conversations/socketEvents";
import type { AuthServerToClientEvents } from "./domains/authAndAccess/socketEvents";

interface ClientToServerEvents extends MessagingClientToServerEvents {}

interface ServerToClientEvents
  extends MessagingServerToClientEvents,
    ConversationsServerToClientEvents,
    AuthServerToClientEvents {}

interface InterServerEvents {}

interface SocketData {
  identity: IdentityDTO;
}

export let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AuthSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export const attachSocket = (server: HttpServer) => {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use(socketAuthMiddleware);

  const onConnection = (socket: AuthSocket) => {
    registerAuthSocketHandlers(io, socket);
    registerMessagingSocketHandlers(io, socket);
  };

  io.on("connection", onConnection);

  return io;
};
