import { Server, Socket } from "socket.io";
import { verifyAccessTokenService } from "../services/verifyAccessTokenService";
import { addUserToRoomsService } from "../../users/services/addUserToRoomsService";

export const authSocketMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const { accessToken } = socket.handshake.auth;
  const result = verifyAccessTokenService({ accessToken });

  if (!result.success || !result.data) {
    return next(new Error("Unauthorized"));
  }

  socket.data.userId = result.data.id;

  await addUserToRoomsService({ socket, userId: result.data.id });

  next();
};

export const registerAuthSocketControllers = (io: Server, socket: Socket) => {
  // No client-emitted events belong to authAccess yet - handlers will be
  // defined above and wired here with socket.on(...) as they're added.
};
