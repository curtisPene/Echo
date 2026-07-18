import { Socket } from "socket.io";
import { verifyAccessTokenService } from "../composition";

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  const { accessToken } = socket.handshake.auth;
  const result = verifyAccessTokenService.execute({ accessToken });

  if (!result.success || !result.data) {
    return next(new Error("Unauthorized"));
  }

  socket.data.identity = result.data;

  next();
};
