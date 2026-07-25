import "dotenv/config";
import type { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { createSocketAuthMiddleware } from "./domains/authAndAccess/middleware/socketAuthMiddleware";
import type { VerifyAccessTokenService } from "./domains/authAndAccess/services/VerifyAccessTokenService";
import { registerAuthSocketHandlers } from "./domains/authAndAccess/socketHandlers/registerAuthSocketHandlers";
import { registerMessagingSocketHandlers } from "./domains/messaging/socketHandlers/registerMessagingSocketHandlers";
import type { AddUserToRoomsService } from "./domains/authAndAccess/services/AddUserToRoomsService";
import type { MessagingControllers } from "./domains/messaging/controllers/socketControllers";
import type { AuthAndAccessSocketControllers } from "./domains/authAndAccess/controllers/socketControllers";
import type { IdentityDTO } from "./domains/authAndAccess/domainModels/identity";
import type {
  MessagingClientToServerEvents,
  MessagingServerToClientEvents,
} from "./domains/messaging/socketEvents";
import type { ConversationsServerToClientEvents } from "./domains/conversations/socketEvents";
import type {
  AuthServerToClientEvents,
  AuthClientToServerEvents,
} from "./domains/authAndAccess/socketEvents";
import type { PresenceServerToClientEvents } from "./domains/presence/socketEvents";
import type { UserConnectedService } from "./domains/presence/services/UserConnectedService";
import type { UserDisconnectedService } from "./domains/presence/services/UserDisconnectedService";

interface ClientToServerEvents
  extends MessagingClientToServerEvents,
    AuthClientToServerEvents {}

interface ServerToClientEvents
  extends MessagingServerToClientEvents,
    ConversationsServerToClientEvents,
    AuthServerToClientEvents,
    PresenceServerToClientEvents {}

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
  authAndAccessSocketControllers: AuthAndAccessSocketControllers,
  userConnectedService: UserConnectedService,
  userDisconnectedService: UserDisconnectedService,
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
    await registerAuthSocketHandlers(
      io,
      socket,
      addUserToRoomsService,
      authAndAccessSocketControllers,
    );
    registerMessagingSocketHandlers(io, socket, messagingControllers);

    await userConnectedService.execute({ userId: socket.data.identity.id });

    // "disconnecting" (not "disconnect") fires while socket.rooms is still
    // populated - Socket.IO clears room membership before "disconnect" fires.
    socket.on("disconnecting", () => {
      const roomIds = [...socket.rooms].filter((room) => room !== socket.id);
      userDisconnectedService.execute({
        userId: socket.data.identity.id,
        roomIds,
      });
    });
  };

  io.on("connection", onConnection);

  return io;
};
