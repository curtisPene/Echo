import { Server } from "socket.io";
import type { AuthSocket } from "../../../socket";
import { addUserToRoomsService } from "../services/addUserToRoomsService";

export const registerAuthSocketHandlers = (io: Server, socket: AuthSocket) => {
  addUserToRoomsService({ socket, userId: socket.data.identity.id });
};
