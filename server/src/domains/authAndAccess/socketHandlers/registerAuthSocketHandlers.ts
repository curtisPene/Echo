import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import type { AddUserToRoomsService } from "../services/AddUserToRoomsService";

export const registerAuthSocketHandlers = async (
  io: Server,
  socket: AuthSocket,
  addUserToRoomsService: AddUserToRoomsService,
) => {
  await addUserToRoomsService.execute({ socket, userId: socket.data.identity.id });
};
