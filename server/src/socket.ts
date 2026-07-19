import "dotenv/config";
import type { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { createSocketAuthMiddleware } from "./domains/authAndAccess/middleware/socketAuthMiddleware";
import type { VerifyAccessTokenService } from "./domains/authAndAccess/services/VerifyAccessTokenService";
import { registerAuthSocketHandlers } from "./domains/authAndAccess/socketHandlers/registerAuthSocketHandlers";
import { registerMessagingSocketHandlers } from "./domains/messaging/socketHandlers/registerMessagingSocketHandlers";
import type { AddUserToRoomsService } from "./domains/authAndAccess/services/AddUserToRoomsService";
import type { MessagingControllers } from "./domains/messaging/controllers/socketControllers";
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

export const attachSocket = (
  server: HttpServer,
  verifyAccessTokenService: VerifyAccessTokenService,
  addUserToRoomsService: AddUserToRoomsService,
  messagingControllers: MessagingControllers,
) => {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use(createSocketAuthMiddleware(verifyAccessTokenService));

  const onConnection = async (socket: AuthSocket) => {
    // Must await room-joining before wiring message:send - otherwise a
    // client can be "connected" and have its send listener live before its
    // socket has actually joined the rooms it belongs to, causing a
    // spurious "Unauthorized room access" rejection on a legitimate send
    // right after connect/reconnect.
    await registerAuthSocketHandlers(io, socket, addUserToRoomsService);
    registerMessagingSocketHandlers(io, socket, messagingControllers);
  };

  io.on("connection", onConnection);

  return io;
};
