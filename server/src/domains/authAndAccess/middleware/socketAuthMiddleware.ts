import { Socket } from "socket.io";
import type { VerifyAccessTokenService } from "../services/VerifyAccessTokenService";

export const createSocketAuthMiddleware = (verifyAccessTokenService: VerifyAccessTokenService) =>
  (socket: Socket, next: (err?: Error) => void) => {
    const { accessToken } = socket.handshake.auth;
    const result = verifyAccessTokenService.execute({ accessToken });

    if (!result.success || !result.data) {
      return next(new Error("Unauthorized"));
    }

    socket.data.identity = result.data;

    next();
  };
