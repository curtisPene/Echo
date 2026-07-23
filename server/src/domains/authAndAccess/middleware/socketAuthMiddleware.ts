import { Socket } from "socket.io";
import type { VerifyAccessTokenService } from "../services/VerifyAccessTokenService";
import { socketHandshakeAuthSchema } from "../types/authTypes";

export const createSocketAuthMiddleware = (verifyAccessTokenService: VerifyAccessTokenService) =>
  (socket: Socket, next: (err?: Error) => void) => {
    const parsed = socketHandshakeAuthSchema.safeParse(socket.handshake.auth);

    if (!parsed.success) {
      return next(new Error("Unauthorized"));
    }

    const result = verifyAccessTokenService.execute({
      accessToken: parsed.data.accessToken,
    });

    if (!result.success || !result.data) {
      return next(new Error("Unauthorized"));
    }

    socket.data.identity = result.data;

    next();
  };
