import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import type { AddUserToRoomsService } from "../services/AddUserToRoomsService";
import { AuthEvents } from "../socketEvents";
import type { AuthAndAccessSocketControllers } from "../controllers/socketControllers";

export const registerAuthSocketHandlers = async (
  io: Server,
  socket: AuthSocket,
  addUserToRoomsService: AddUserToRoomsService,
  authAndAccessSocketControllers: AuthAndAccessSocketControllers,
) => {
  await addUserToRoomsService.execute({ socket, userId: socket.data.identity.id });

  socket.on(AuthEvents.LOGOUT, (ack) => {
    authAndAccessSocketControllers.onLogoutController({ socket, ack });
  });
};
