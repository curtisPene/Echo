import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import { addUserToRoomsService } from "../composition";

export const registerAuthSocketHandlers = async (
  io: Server,
  socket: AuthSocket,
) => {
  await addUserToRoomsService.execute({ socket, userId: socket.data.identity.id });
};
